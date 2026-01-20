BEGIN;

CREATE TYPE order_state AS ENUM (
  'NEW',
  'ACCEPTED',
  'SHIPPED',
  'DELIVERED',
  'NEEDS_REVIEW'
);

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  shopee_shop_id TEXT NOT NULL UNIQUE,
  kill_switch BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id),
  shopee_order_id TEXT NOT NULL,
  state order_state NOT NULL,
  state_version INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  needs_review_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, shopee_order_id)
);

CREATE TABLE job_runs (
  id SERIAL PRIMARY KEY,
  account_id INTEGER,
  order_id INTEGER,
  job_type TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  next_run_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE external_effects (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  effect_type TEXT NOT NULL,
  effect_key TEXT NOT NULL UNIQUE,
  payload_ref JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE system_controls (
  id INTEGER PRIMARY KEY DEFAULT 1,
  global_kill_switch BOOLEAN NOT NULL DEFAULT false,
  polling_enabled BOOLEAN NOT NULL DEFAULT true,
  max_backlog INTEGER NOT NULL DEFAULT 5,
  max_daily_orders INTEGER NOT NULL DEFAULT 20,
  stop_revenue_limit INTEGER NOT NULL DEFAULT 6000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

INSERT INTO system_controls (id) VALUES (1)
ON CONFLICT DO NOTHING;

COMMIT;
