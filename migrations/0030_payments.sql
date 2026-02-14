-- Stripe payment orders
CREATE TABLE IF NOT EXISTS payment_orders (
  id TEXT PRIMARY KEY,
  customer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'checkout_started', 'paid', 'fulfilled', 'refunded', 'partially_refunded', 'disputed', 'expired', 'cancelled')),
  amount INTEGER NOT NULL DEFAULT 0,
  service_fee INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  stripe_charge_id TEXT,
  payment_method TEXT,
  card_brand TEXT,
  card_last4 TEXT,
  metadata TEXT,
  fulfilled INTEGER NOT NULL DEFAULT 0,
  paid_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_email ON payment_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_stripe_session ON payment_orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_stripe_intent ON payment_orders(stripe_payment_intent);

-- Line items for orders
CREATE TABLE IF NOT EXISTS payment_order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES payment_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_order_items_order ON payment_order_items(order_id);

-- Customer tracking synced with Stripe
CREATE TABLE IF NOT EXISTS payment_customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT UNIQUE,
  member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_payment_customers_email ON payment_customers(email);
CREATE INDEX IF NOT EXISTS idx_payment_customers_stripe ON payment_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_customers_member ON payment_customers(member_id);

-- Webhook event idempotency & audit
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id TEXT PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  payload TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_stripe_event ON payment_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_type ON payment_webhook_events(event_type);

-- Add ticket fields to events table
ALTER TABLE events ADD COLUMN tickets_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN ticket_types TEXT;
ALTER TABLE events ADD COLUMN stripe_product_id TEXT;
ALTER TABLE events ADD COLUMN service_fee_percent REAL NOT NULL DEFAULT 5.0;
