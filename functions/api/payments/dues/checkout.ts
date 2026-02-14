import type { Env } from '../../../types';
import { requireAuth, generateId } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { sanitize } from '../../../lib/validate';
import { getStripe, createCheckoutSession, calculateServiceFee } from '../../../lib/stripe';

interface DuesCheckoutRequest {
  dues_id: string;
  amount?: number; // optional - uses remaining balance if not provided
  successUrl?: string;
  cancelUrl?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const result = await requireAuth(context.request, context.env.DB);
    if (result.errorResponse) return result.errorResponse;

    const body = await context.request.json() as DuesCheckoutRequest;
    const duesId = sanitize(body.dues_id);

    if (!duesId) {
      return error('dues_id is required', 400);
    }

    // Get dues record
    const dues = await context.env.DB.prepare(
      `SELECT d.*, s.name as semester_name, m.first_name, m.last_name, m.email
       FROM dues d
       JOIN semesters s ON d.semester_id = s.id
       JOIN members m ON d.member_id = m.id
       WHERE d.id = ?`
    ).bind(duesId).first();

    if (!dues) {
      return error('Dues record not found', 404);
    }

    // Check if user can pay this dues (must be their own or exec)
    const isExec = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'].includes(result.auth.member.role);
    if (dues.member_id !== result.auth.member.id && !isExec) {
      return error('You can only pay your own dues', 403);
    }

    // Calculate remaining balance
    const remaining = (dues.amount_due as number) - (dues.amount_paid as number);
    if (remaining <= 0) {
      return error('Dues are already paid in full', 400);
    }

    // Use provided amount or remaining balance
    let paymentAmount = body.amount;
    if (!paymentAmount || paymentAmount <= 0) {
      paymentAmount = remaining;
    }
    if (paymentAmount > remaining) {
      paymentAmount = remaining;
    }

    const serviceFeePercent = 5;
    const serviceFee = calculateServiceFee(paymentAmount, serviceFeePercent);
    const totalAmount = paymentAmount + serviceFee;

    const memberName = `${dues.first_name} ${dues.last_name}`;
    const customerEmail = dues.email as string;

    const url = new URL(context.request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const successUrl = body.successUrl || `${baseUrl}/dashboard/finance?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${baseUrl}/dashboard/finance?payment=cancelled`;

    const stripe = getStripe(context.env.STRIPE_SECRET_KEY);

    // Create order in DB
    const orderId = generateId();
    const metadata = {
      type: 'dues',
      dues_id: duesId,
      semester: dues.semester_name as string,
      member_id: dues.member_id as string,
      member_name: memberName,
      amount: String(paymentAmount),
    };

    await context.env.DB.prepare(
      `INSERT INTO payment_orders (id, customer_email, status, amount, service_fee, metadata)
       VALUES (?, ?, 'created', ?, ?, ?)`
    ).bind(orderId, customerEmail, totalAmount, serviceFee, JSON.stringify(metadata)).run();

    // Create order item
    const itemId = generateId();
    await context.env.DB.prepare(
      `INSERT INTO payment_order_items (id, order_id, name, description, amount, quantity, total)
       VALUES (?, ?, ?, ?, ?, 1, ?)`
    ).bind(
      itemId,
      orderId,
      `${dues.semester_name} Dues`,
      `Dues payment for ${memberName}`,
      paymentAmount,
      paymentAmount
    ).run();

    // Create Stripe checkout session
    const session = await createCheckoutSession(stripe, {
      items: [{
        name: `${dues.semester_name} Dues`,
        description: `Dues payment for ${memberName}`,
        amount: paymentAmount,
        quantity: 1,
      }],
      customerEmail,
      successUrl,
      cancelUrl,
      metadata: { ...metadata, order_id: orderId },
      serviceFeePercent,
      passFeesToBuyer: true,
    });

    // Update order with Stripe session ID
    await context.env.DB.prepare(
      `UPDATE payment_orders SET stripe_session_id = ?, status = 'checkout_started', updated_at = datetime('now') WHERE id = ?`
    ).bind(session.id, orderId).run();

    return json({
      orderId,
      sessionId: session.id,
      checkoutUrl: session.url,
      duesId,
      paymentAmount,
      serviceFee,
      totalAmount,
    }, 201);
  } catch (err) {
    console.error('Dues checkout error:', err);
    return error('Failed to create dues checkout', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
