import { db } from '../db/index.js';

export async function assertLimits(accountId: number) {
  const backlog = await db.query(
    `SELECT count(*) FROM orders
     WHERE account_id = $1
       AND state IN ('NEW','ACCEPTED','SHIPPED')`,
    [accountId]
  );

  const controls = await db.query(
    `SELECT max_backlog FROM system_controls WHERE id = 1`
  );

  if (Number(backlog.rows[0].count) >= controls.rows[0].max_backlog) {
    throw new Error('BACKLOG_LIMIT_REACHED');
  }
}
