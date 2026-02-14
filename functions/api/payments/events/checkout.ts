import type { Env } from '../../../types';
import { generateId } from '../../../lib/auth';
import { json, error, options } from '../../../lib/response';
import { sanitize, isValidEmail } from '../../../lib/validate';
import { getStripe, createCheckoutSession, calculateServiceFee } from '../../../lib/stripe';

interface TicketType {
  id: string;
  name: string;
  price: number; // in cents
  description?: string;
  available?: number;
}

interface EventTicketCheckoutRequest {
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  customer_email: string;
  customer_name?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as EventTicketCheckoutRequest;

    const eventId = sanitize(body.event_id);
    const ticketTypeId = sanitize(body.ticket_type_id);
    const quantity = typeof body.quantity === 'number' && body.quantity > 0 ? body.quantity : 1;
    const customerEmail = sanitize(body.customer_email);
    const customerName = sanitize(body.customer_name || '');

    if (!eventId || !ticketTypeId) {
      return error('event_id and ticket_type_id are required', 400);
    }

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return error('Valid email is required', 400);
    }

    // Get event
    const event = await context.env.DB.prepare(
      `SELECT id, title, slug, start_time, tickets_enabled, ticket_types, service_fee_percent
       FROM events WHERE id = ? AND is_public = 1`
    ).bind(eventId).first();

    if (!event) {
      return error('Event not found', 404);
    }

    if (!event.tickets_enabled) {
      return error('Tickets are not enabled for this event', 400);
    }

    // Check event hasn't passed
    const eventDate = new Date(event.start_time + 'Z');
    if (eventDate < new Date()) {
      return error('This event has already passed', 400);
    }

    // Parse ticket types
    let ticketTypes: TicketType[] = [];
    try {
      ticketTypes = event.ticket_types ? JSON.parse(event.ticket_types as string) : [];
    } catch {
      return error('Invalid ticket configuration', 500);
    }

    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    if (!ticketType) {
      return error('Ticket type not found', 404);
    }

    // Check availability (basic check - webhook handles actual decrement)
    if (ticketType.available !== undefined && ticketType.available < quantity) {
      return error('Not enough tickets available', 400);
    }

    const serviceFeePercent = (event.service_fee_percent as number) || 5;
    const ticketTotal = ticketType.price * quantity;
    const serviceFee = calculateServiceFee(ticketTotal, serviceFeePercent);
    const totalAmount = ticketTotal + serviceFee;

    const url = new URL(context.request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const successUrl = `${baseUrl}/events/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/events/detail?slug=${event.slug}`;

    const stripe = getStripe(context.env.STRIPE_SECRET_KEY);

    // Create order in DB
    const orderId = generateId();
    const metadata = {
      type: 'event_ticket',
      event_id: eventId,
      event_title: event.title as string,
      event_slug: event.slug as string,
      ticket_type_id: ticketTypeId,
      ticket_type_name: ticketType.name,
      quantity: String(quantity),
      customer_name: customerName,
    };

    await context.env.DB.prepare(
      `INSERT INTO payment_orders (id, customer_email, status, amount, service_fee, metadata)
       VALUES (?, ?, 'created', ?, ?, ?)`
    ).bind(orderId, customerEmail, totalAmount, serviceFee, JSON.stringify(metadata)).run();

    // Create order item
    const itemId = generateId();
    await context.env.DB.prepare(
      `INSERT INTO payment_order_items (id, order_id, name, description, amount, quantity, total)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      itemId,
      orderId,
      `${event.title} - ${ticketType.name}`,
      ticketType.description || `Ticket for ${event.title}`,
      ticketType.price,
      quantity,
      ticketTotal
    ).run();

    // Create Stripe checkout session
    const session = await createCheckoutSession(stripe, {
      items: [{
        name: `${event.title} - ${ticketType.name}`,
        description: ticketType.description || `Ticket for ${event.title}`,
        amount: ticketType.price,
        quantity,
      }],
      customerEmail,
      successUrl,
      cancelUrl,
      metadata: { ...metadata, order_id: orderId },
      serviceFeePercent,
      passFeesToBuyer: true,
      statementDescriptor: 'HOUSTON OMEGAS',
    });

    // Update order with Stripe session ID
    await context.env.DB.prepare(
      `UPDATE payment_orders SET stripe_session_id = ?, status = 'checkout_started', updated_at = datetime('now') WHERE id = ?`
    ).bind(session.id, orderId).run();

    return json({
      orderId,
      sessionId: session.id,
      checkoutUrl: session.url,
      eventId,
      ticketType: ticketType.name,
      quantity,
      ticketTotal,
      serviceFee,
      totalAmount,
    }, 201);
  } catch (err) {
    console.error('Event ticket checkout error:', err);
    return error('Failed to create ticket checkout', 500);
  }
};

export const onRequestOptions: PagesFunction = async () => options();
