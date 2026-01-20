import { db } from '../db/index.js';
import { gateOrder } from '../services/gate.service.js';
import { logger } from '../logger.js';

export async function runGateOrders() {
  const res = await db.query(
    `
    SELECT id, account_id, state, state_version
    FROM orders
    WHERE state = 'NEW'
    ORDER BY created_at ASC
    LIMIT 5
    `
  );

  logger.info('GATE_BATCH', { count: res.rows.length });

  for (const row of res.rows) {
    const orderId = row.id as number;
    const accountId = row.account_id as number;

    try {
      logger.info('GATE_CHECK', {
        orderId,
        accountId,
        state: row.state,
        stateVersion: row.state_version
      });

      const result = await gateOrder({ orderId, accountId });

      if (result.gated) {
        logger.warn('GATE_BLOCKED', { orderId, accountId, reason: result.reason });
      } else {
        logger.info('GATE_PASSED', { orderId, accountId });
      }
    } catch (err: any) {
      logger.error('GATE_ERROR', {
        orderId,
        accountId,
        message: err?.message ?? String(err),
        stack: err?.stack
      });
    }
  }
}
