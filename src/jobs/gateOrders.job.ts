import { db } from '../db/index.js';
import { gateOrder } from '../services/gate.service.js';
import { logger } from '../logger.js';

export async function runGateOrders() {
  const res = await db.query(
    `
    SELECT id, account_id
    FROM orders
    WHERE state = 'NEW'
    ORDER BY created_at ASC
    LIMIT 5
    `
  );

  for (const row of res.rows) {
    const orderId = row.id as number;
    const accountId = row.account_id as number;

    logger.info('GATE_CHECK', { orderId, accountId });

    const result = await gateOrder({ orderId, accountId });

    if (result.gated) {
      logger.warn('GATE_BLOCKED', { orderId, reason: result.reason });
    } else {
      logger.info('GATE_PASSED', { orderId });
    }
  }
}
