import type { Env } from '../../../types';
import { generateId } from '../../../lib/auth';
import { json, error } from '../../../lib/response';
import { getStripe, constructWebhookEvent, retrieveSession, getChargeDetails } from '../../../lib/stripe';
import { notifyDiscord } from '../../../lib/notify';

async function sendPaymentNotification(webhookUrl: string, order: Record<string, unknown>, eventType: string) {
  const emoji = eventType.includes('succeeded') || eventType.includes('completed') ? '💰' : '⚠️';
  const amount = ((order.amount as number) / 100).toFixed(2);
  const status = order.status as string;

  await notifyDiscord(webhookUrl, {
    content: `${emoji} **Payment ${status.toUpperCase()}**\n` +
      `Email: ${order.customer_email}\n` +
      `Amount: $${amount}\n` +
      `Order: ${order.id}`,
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const signature = context.request.headers.get('stripe-signature');
    if (!signature) {
      return error('Missing Stripe signature', 400);
    }

    const payload = await context.request.text();
    const stripe = getStripe(context.env.STRIPE_SECRET_KEY);

    let event;
    try {
      event = constructWebhookEvent(stripe, payload, signature, context.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return error('Invalid signature', 400);
    }

    // Check for duplicate event
    const existing = await context.env.DB.prepare(
      `SELECT id FROM payment_webhook_events WHERE stripe_event_id = ?`
    ).bind(event.id).first();

    if (existing) {
      return json({ received: true, duplicate: true });
    }

    // Store webhook event
    const webhookId = generateId();
    await context.env.DB.prepare(
      `INSERT INTO payment_webhook_events (id, stripe_event_id, event_type, payload)
       VALUES (?, ?, ?, ?)`
    ).bind(webhookId, event.id, event.type, JSON.stringify(event.data)).run();

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as { id: string; payment_intent: string; metadata?: { order_id?: string } };
          const orderId = session.metadata?.order_id;

          if (orderId) {
            // Get payment details
            let chargeId = null;
            let cardBrand = null;
            let cardLast4 = null;
            let paymentMethod = null;

            if (session.payment_intent && typeof session.payment_intent === 'string') {
              const pi = await stripe.paymentIntents.retrieve(session.payment_intent, { expand: ['charges'] });
              const details = getChargeDetails(pi);
              chargeId = details.chargeId;
              cardBrand = details.cardBrand;
              cardLast4 = details.cardLast4;
              paymentMethod = details.paymentMethod;
            }

            await context.env.DB.prepare(
              `UPDATE payment_orders
               SET status = 'paid',
                   stripe_payment_intent = ?,
                   stripe_charge_id = ?,
                   card_brand = ?,
                   card_last4 = ?,
                   payment_method = ?,
                   paid_at = datetime('now'),
                   updated_at = datetime('now')
               WHERE id = ?`
            ).bind(
              typeof session.payment_intent === 'string' ? session.payment_intent : null,
              chargeId,
              cardBrand,
              cardLast4,
              paymentMethod,
              orderId
            ).run();

            // Get order for notification
            const order = await context.env.DB.prepare(
              `SELECT * FROM payment_orders WHERE id = ?`
            ).bind(orderId).first();

            if (order && context.env.DISCORD_WEBHOOK_URL) {
              await sendPaymentNotification(context.env.DISCORD_WEBHOOK_URL, order as Record<string, unknown>, event.type);
            }

            // Process fulfillment based on metadata type
            const orderRow = await context.env.DB.prepare(`SELECT metadata FROM payment_orders WHERE id = ?`).bind(orderId).first();
            if (orderRow?.metadata) {
              const metadata = JSON.parse(orderRow.metadata as string);

              // Handle dues payment
              if (metadata.type === 'dues' && metadata.dues_id) {
                const dues = await context.env.DB.prepare(`SELECT * FROM dues WHERE id = ?`).bind(metadata.dues_id).first();
                if (dues) {
                  const paidAmount = parseInt(metadata.amount) || 0;
                  const newPaid = (dues.amount_paid as number) + paidAmount;
                  const newStatus = newPaid >= (dues.amount_due as number) ? 'paid' : 'partial';

                  await context.env.DB.prepare(
                    `UPDATE dues SET amount_paid = ?, status = ?, updated_at = datetime('now') WHERE id = ?`
                  ).bind(newPaid, newStatus, metadata.dues_id).run();
                }
              }

              // Mark as fulfilled
              await context.env.DB.prepare(
                `UPDATE payment_orders SET fulfilled = 1, status = 'fulfilled', updated_at = datetime('now') WHERE id = ?`
              ).bind(orderId).run();
            }
          }
          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object as { metadata?: { order_id?: string } };
          const orderId = session.metadata?.order_id;
          if (orderId) {
            await context.env.DB.prepare(
              `UPDATE payment_orders SET status = 'expired', updated_at = datetime('now') WHERE id = ?`
            ).bind(orderId).run();
          }
          break;
        }

        case 'charge.refunded': {
          const charge = event.data.object as { id: string; refunded: boolean; amount_refunded: number };
          const order = await context.env.DB.prepare(
            `SELECT * FROM payment_orders WHERE stripe_charge_id = ?`
          ).bind(charge.id).first();

          if (order) {
            const newStatus = charge.amount_refunded >= (order.amount as number) ? 'refunded' : 'partially_refunded';
            await context.env.DB.prepare(
              `UPDATE payment_orders SET status = ?, updated_at = datetime('now') WHERE id = ?`
            ).bind(newStatus, order.id).run();
          }
          break;
        }

        case 'charge.dispute.created': {
          const dispute = event.data.object as { charge: string };
          const chargeId = typeof dispute.charge === 'string' ? dispute.charge : null;
          if (chargeId) {
            await context.env.DB.prepare(
              `UPDATE payment_orders SET status = 'disputed', updated_at = datetime('now') WHERE stripe_charge_id = ?`
            ).bind(chargeId).run();
          }
          break;
        }
      }

      // Mark webhook as processed
      await context.env.DB.prepare(
        `UPDATE payment_webhook_events SET processed = 1, processed_at = datetime('now') WHERE id = ?`
      ).bind(webhookId).run();

    } catch (processError) {
      console.error('Webhook processing error:', processError);
      await context.env.DB.prepare(
        `UPDATE payment_webhook_events SET error = ? WHERE id = ?`
      ).bind(String(processError), webhookId).run();
    }

    return json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return error('Webhook processing failed', 500);
  }
};
