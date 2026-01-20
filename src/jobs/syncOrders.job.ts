import { ShopeeMockClient } from '../adapters/shopee/client.mock.js';
import { upsertOrder } from '../repositories/orders.repo.js';
import { logger } from '../logger.js';
import { db } from '../db/index.js';

function computeWindowISO(now: Date) {
  const end = new Date(Math.floor(now.getTime() / 60000) * 60000); // arredonda p/ minuto
  const start = new Date(end.getTime() - 10 * 60 * 1000); // -10 min
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export async function runSyncOrders() {
  const client = new ShopeeMockClient();
  const now = new Date();
  const { startISO, endISO } = computeWindowISO(now);

  // todas as contas ativas (kill switch NÃO bloqueia polling)
  const accounts = await db.query(
    `SELECT id FROM accounts`
  );

  for (const row of accounts.rows) {
    const accountId = row.id as number;

    logger.info('SYNC_START', { accountId, startISO, endISO });

    const orders = await client.fetchOrders({
      windowStartISO: startISO,
      windowEndISO: endISO
    });

    for (const o of orders) {
      await upsertOrder({
        accountId,
        shopeeOrderId: o.shopee_order_id,
        seenAtISO: o.updated_at
      });
    }

    logger.info('SYNC_END', {
      accountId,
      count: orders.length
    });
  }
}
