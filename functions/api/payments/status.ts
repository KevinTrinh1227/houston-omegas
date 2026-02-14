import type { Env } from '../../types';
import { json, error, options } from '../../lib/response';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const orderId = url.searchParams.get('order_id');
    const sessionId = url.searchParams.get('session_id');

    if (!orderId && !sessionId) {
      return error('order_id or session_id is required', 400);
    }

    let order;
    if (orderId) {
      order = await context.env.DB.prepare(
        `SELECT id, customer_email, status, amount, service_fee, payment_method, card_brand, card_last4, fulfilled, paid_at, created_at
         FROM payment_orders WHERE id = ?`
      ).bind(orderId).first();
    } else if (sessionId) {
      order = await context.env.DB.prepare(
        `SELECT id, customer_email, status, amount, service_fee, payment_method, card_brand, card_last4, fulfilled, paid_at, created_at
         FROM payment_orders WHERE stripe_session_id = ?`
      ).bind(sessionId).first();
    }

    if (!order) {
      return error('Order not found', 404);
    }

    // Get order items
    const items = await context.env.DB.prepare(
      `SELECT name, description, amount, quantity, total FROM payment_order_items WHERE order_id = ?`
    ).bind(order.id).all();

    return json({
      ...order,
      items: items.results,
    });
  } catch (err) {
    console.error('Status error:', err);
    return error('Failed to get order status', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
