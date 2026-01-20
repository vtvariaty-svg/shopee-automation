import { db } from '../db/index.js';

export async function upsertOrder(params: {
  accountId: number;
  shopeeOrderId: string;
  seenAtISO: string;
}) {
  const { accountId, shopeeOrderId, seenAtISO } = params;

  await db.query(
    `
    INSERT INTO orders (account_id, shopee_order_id, state, last_seen_at)
    VALUES ($1, $2, 'NEW', $3)
    ON CONFLICT (account_id, shopee_order_id)
    DO UPDATE SET
      last_seen_at = EXCLUDED.last_seen_at,
      updated_at = now()
    `,
    [accountId, shopeeOrderId, seenAtISO]
  );
}
