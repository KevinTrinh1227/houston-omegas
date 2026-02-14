import Stripe from 'stripe';

const STRIPE_API_VERSION = '2025-03-31.basil' as Stripe.LatestApiVersion;

export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });
}

export interface CheckoutItem {
  name: string;
  description?: string;
  amount: number; // in cents
  quantity: number;
}

export interface CreateCheckoutOptions {
  items: CheckoutItem[];
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  statementDescriptor?: string;
  serviceFeePercent?: number;
  passFeesToBuyer?: boolean;
  allowPromoCodes?: boolean;
  collectAddress?: boolean;
}

export function calculateServiceFee(amount: number, percent: number): number {
  return Math.ceil(amount * (percent / 100));
}

export async function createCheckoutSession(
  stripe: Stripe,
  options: CreateCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const {
    items,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
    statementDescriptor = 'HOUSTON OMEGAS',
    serviceFeePercent = 5,
    passFeesToBuyer = true,
    allowPromoCodes = false,
    collectAddress = false,
  } = options;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    let unitAmount = item.amount;
    if (passFeesToBuyer && serviceFeePercent > 0) {
      const fee = calculateServiceFee(item.amount, serviceFeePercent);
      unitAmount = item.amount + fee;
    }

    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description,
        },
        unit_amount: unitAmount,
      },
      quantity: item.quantity,
    };
  });

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card', 'cashapp'],
    line_items: lineItems,
    customer_email: customerEmail,
    success_url: successUrl.replace('{CHECKOUT_SESSION_ID}', '{CHECKOUT_SESSION_ID}'),
    cancel_url: cancelUrl,
    metadata,
    payment_intent_data: {
      statement_descriptor: statementDescriptor.substring(0, 22),
      metadata,
    },
    allow_promotion_codes: allowPromoCodes,
  };

  if (collectAddress) {
    params.billing_address_collection = 'required';
  }

  return stripe.checkout.sessions.create(params);
}

export async function retrieveSession(
  stripe: Stripe,
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'payment_intent.charges'],
  });
}

export async function retrievePaymentIntent(
  stripe: Stripe,
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['charges'],
  });
}

export function constructWebhookEvent(
  stripe: Stripe,
  payload: string,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export function getChargeDetails(paymentIntent: Stripe.PaymentIntent): {
  chargeId: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  paymentMethod: string | null;
} {
  const charges = paymentIntent.charges?.data;
  if (!charges || charges.length === 0) {
    return { chargeId: null, cardBrand: null, cardLast4: null, paymentMethod: null };
  }

  const charge = charges[0];
  const pm = charge.payment_method_details;

  return {
    chargeId: charge.id,
    cardBrand: pm?.card?.brand || pm?.cashapp ? 'cashapp' : null,
    cardLast4: pm?.card?.last4 || null,
    paymentMethod: pm?.type || null,
  };
}
