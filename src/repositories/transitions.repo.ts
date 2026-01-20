import { db } from '../db/index.js';
import type { OrderState } from '../models/types.js';

export async function insertTransition(params: {
  orderId: number;
  fromState: OrderState;
  toState: OrderState;
  triggerJob: string;
  reason?: string | null;
  idempotencyKey: string;
}) {
  const { orderId, fromState, toState, triggerJob, reason, idempotencyKey } = params;

  await db.query(
    `
    INSERT INTO order_state_transitions
      (order_id, from_state, to_state, trigger_job, reason, idempotency_key)
    VALUES
      ($1, $2, $3, $4, $5, $6)
    `,
    [orderId, fromState, toState, triggerJob, reason ?? null, idempotencyKey]
  );
}
