import { db } from '../db/index.js';

export async function getBacklogCount(accountId: number) {
  const res = await db.query(
    `
    SELECT count(*)::int AS cnt
    FROM orders
    WHERE account_id = $1
      AND state IN ('NEW','ACCEPTED','SHIPPED')
    `,
    [accountId]
  );
  return res.rows[0].cnt;
}

export async function getTodayOrdersCount(accountId: number) {
  const res = await db.query(
    `
    SELECT count(*)::int AS cnt
    FROM orders
    WHERE account_id = $1
      AND created_at::date = now()::date
    `,
    [accountId]
  );
  return res.rows[0].cnt;
}
