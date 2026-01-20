import { db } from '../db/index.js';
import { acceptOrder } from '../services/accept.service.js';
import { logger } from '../logger.js';

export async function runAcceptOrders() {
  const res = await db.query(
    `
    SELECT id, account_id, shopee_order_id
    FROM orders
    WHERE state = 'NEW'
      AND needs_review_reason IS NULL
    ORDER BY created_at ASC
    LIMIT 2
    `
  );

  for (const row of res.rows) {
    const orderId = row.id as number;
    const accountId = row.account_id as number;
    const shopeeOrderSn = row.shopee_order_id as string;

    try {
      logger.info('ACCEPT_START', { orderId, accountId });

      await acceptOrder({
        orderId,
        accountId,
        shopeeOrderSn
      });

      logger.info('ACCEPT_SUCCESS', { orderId });
    } catch (err: any) {
      logger.error('ACCEPT_FAIL', {
        orderId,
        message: err.message
      });
    }
  }
}
