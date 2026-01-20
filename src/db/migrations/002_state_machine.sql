BEGIN;

-- Auditoria de transições (FECHADA e idempotente)
CREATE TABLE IF NOT EXISTS order_state_transitions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_state order_state NOT NULL,
  to_state order_state NOT NULL,
  trigger_job TEXT NOT NULL,
  reason TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aceito => accepted_at não pode ser null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_orders_accepted_at'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT ck_orders_accepted_at
      CHECK ((state <> 'ACCEPTED') OR (accepted_at IS NOT NULL));
  END IF;
END $$;

-- Enviado => shipped_at não pode ser null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_orders_shipped_at'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT ck_orders_shipped_at
      CHECK ((state <> 'SHIPPED') OR (shipped_at IS NOT NULL));
  END IF;
END $$;

-- Entregue => delivered_at não pode ser null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_orders_delivered_at'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT ck_orders_delivered_at
      CHECK ((state <> 'DELIVERED') OR (delivered_at IS NOT NULL));
  END IF;
END $$;

COMMIT;
