import type { OrderState } from '../models/types.js';
import { db } from '../db/index.js';
import { assertValidTransition, isTerminal } from '../stateMachine/transitions.js';
import { getOrderById, updateOrderStateTx } from '../repositories/orders.repo.js';
import { insertTransition } from '../repositories/transitions.repo.js';

export async function transitionOrder(params: {
  orderId: number;
  toState: OrderState;
  reason?: string | null;
  idempotencyKey: string;
  triggerJob?: string; // default ADMIN nesta fase
}) {
  const { orderId, toState, reason, idempotencyKey } = params;
  const triggerJob = params.triggerJob ?? 'ADMIN';

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const order = await getOrderById(orderId);
    if (!order) throw new Error('ORDER_NOT_FOUND');

    const fromState = order.state as OrderState;

    // Regras duras
    if (fromState === 'NEEDS_REVIEW') {
      throw new Error('BLOCKED_IN_NEEDS_REVIEW');
    }
    if (isTerminal(fromState)) {
      throw new Error('BLOCKED_TERMINAL_STATE');
    }

    assertValidTransition(fromState, toState);

    const nowISO = new Date().toISOString();

    // Update com controle otimista
    const updated = await updateOrderStateTx({
      orderId,
      expectedStateVersion: Number(order.state_version),
      fromState,
      toState,
      nowISO,
      needsReviewReason: toState === 'NEEDS_REVIEW' ? (reason ?? 'NEEDS_REVIEW') : null
    });

    if (!updated) {
      throw new Error('CONCURRENT_UPDATE_OR_STATE_MISMATCH');
    }

    // Auditoria idempotente (unique)
    await insertTransition({
      orderId,
      fromState,
      toState,
      triggerJob,
      reason: reason ?? null,
      idempotencyKey
    });

    await client.query('COMMIT');

    return {
      orderId,
      fromState,
      toState,
      stateVersion: Number(updated.state_version)
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
