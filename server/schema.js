/** Tables are created automatically on the first request (safe to run many times). */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,            -- Clerk user id
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description VARCHAR(4000),
  price       NUMERIC(10,2) NOT NULL,
  stock       INTEGER NOT NULL DEFAULT 0,
  category    VARCHAR(100) NOT NULL,
  image_url   VARCHAR(500),
  active      BOOLEAN NOT NULL DEFAULT TRUE,   -- delete = false, so old orders keep working
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id                   SERIAL PRIMARY KEY,
  user_id              TEXT NOT NULL REFERENCES users(id),
  status               VARCHAR(30) NOT NULL,
  payment_status       VARCHAR(20) NOT NULL,
  total_amount         NUMERIC(10,2) NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at              TIMESTAMPTZ,
  shipping_name        VARCHAR(100) NOT NULL,
  shipping_phone       VARCHAR(20) NOT NULL,
  shipping_address     VARCHAR(300) NOT NULL,
  shipping_city        VARCHAR(100) NOT NULL,
  shipping_state       VARCHAR(100) NOT NULL,
  shipping_pincode     VARCHAR(6) NOT NULL,
  tracking_number      VARCHAR(100),
  courier              VARCHAR(100),
  razorpay_order_id    VARCHAR(100),
  razorpay_payment_id  VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_paid_idx ON orders(payment_status, paid_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS orders_rzp_idx ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS order_items (
  id            SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    INTEGER NOT NULL,
  product_name  VARCHAR(200) NOT NULL,
  image_url     VARCHAR(500),
  unit_price    NUMERIC(10,2) NOT NULL,
  quantity      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_events (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      VARCHAR(30) NOT NULL,
  note        VARCHAR(500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events(order_id);
`
