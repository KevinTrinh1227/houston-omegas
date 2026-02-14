import type { Env } from '../../types';
import { generateId } from '../../lib/auth';
import { json, error, options } from '../../lib/response';
import { sanitize, isValidEmail } from '../../lib/validate';
import { getStripe, createCheckoutSession, calculateServiceFee } from '../../lib/stripe';

interface CheckoutItem {
  name: string;
  description?: string;
  amount: number;
  quantity: number;
}

interface CheckoutRequest {
  items: CheckoutItem[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  passFeesToBuyer?: boolean;
  serviceFeePercent?: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as CheckoutRequest;

    const customerEmail = sanitize(body.customerEmail);
    if (!customerEmail || !isValidEmail(customerEmail)) {
      return error('Valid email is required', 400);
    }

    const items = body.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return error('At least one item is required', 400);
    }

    for (const item of items) {
      if (!item.name || typeof item.amount !== 'number' || item.amount <= 0 || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return error('Each item must have name, positive amount, and positive quantity', 400);
      }
    }

    const successUrl = body.successUrl;
    const cancelUrl = body.cancelUrl;
    if (!successUrl || !cancelUrl) {
      return error('successUrl and cancelUrl are required', 400);
    }

    const serviceFeePercent = typeof body.serviceFeePercent === 'number' ? body.serviceFeePercent : 5;
    const passFeesToBuyer = body.passFeesToBuyer !== false;
    const metadata = body.metadata || {};

    const stripe = getStripe(context.env.STRIPE_SECRET_KEY);

    // Calculate totals
    let subtotal = 0;
    let totalFee = 0;
    for (const item of items) {
      subtotal += item.amount * item.quantity;
      if (passFeesToBuyer) {
        totalFee += calculateServiceFee(item.amount, serviceFeePercent) * item.quantity;
      }
    }
    const totalAmount = subtotal + totalFee;

    // Create order in DB
    const orderId = generateId();
    await context.env.DB.prepare(
      `INSERT INTO payment_orders (id, customer_email, status, amount, service_fee, metadata)
       VALUES (?, ?, 'created', ?, ?, ?)`
    ).bind(orderId, customerEmail, totalAmount, totalFee, JSON.stringify(metadata)).run();

    // Create order items
    for (const item of items) {
      const itemId = generateId();
      const itemTotal = item.amount * item.quantity;
      await context.env.DB.prepare(
        `INSERT INTO payment_order_items (id, order_id, name, description, amount, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(itemId, orderId, item.name, item.description || null, item.amount, item.quantity, itemTotal).run();
    }

    // Create Stripe checkout session
    const session = await createCheckoutSession(stripe, {
      items,
      customerEmail,
      successUrl: successUrl.includes('{CHECKOUT_SESSION_ID}')
        ? successUrl
        : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl,
      metadata: { ...metadata, order_id: orderId },
      serviceFeePercent,
      passFeesToBuyer,
    });

    // Update order with Stripe session ID
    await context.env.DB.prepare(
      `UPDATE payment_orders SET stripe_session_id = ?, status = 'checkout_started', updated_at = datetime('now') WHERE id = ?`
    ).bind(session.id, orderId).run();

    return json({
      orderId,
      sessionId: session.id,
      checkoutUrl: session.url,
      amount: totalAmount,
      serviceFee: totalFee,
    }, 201);
  } catch (err) {
    console.error('Checkout error:', err);
    return error('Failed to create checkout session', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
