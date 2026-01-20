BEGIN;

CREATE TABLE IF NOT EXISTS accounts_shopee_credentials (
  account_id INTEGER PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  partner_id TEXT NOT NULL,
  partner_key TEXT NOT NULL,
  shop_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
