import { getBacklogCount, getTodayOrdersCount } from '../repositories/metrics.repo.js';
import { transitionOrder } from './orderState.service.js';

export async function gateOrder(params: {
  orderId: number;
  accountId: number;
}) {
  const { orderId, accountId } = params;

  // Regras duras (fase 3)
  const backlog = await getBacklogCount(accountId);
  if (backlog > 5) {
    await transitionOrder({
      orderId,
      toState: 'NEEDS_REVIEW',
      reason: 'BACKLOG_LIMIT_EXCEEDED',
      idempotencyKey: `gate:${orderId}:backlog`
    });
    return { gated: true, reason: 'BACKLOG_LIMIT_EXCEEDED' };
  }

  const today = await getTodayOrdersCount(accountId);
  if (today > 20) {
    await transitionOrder({
      orderId,
      toState: 'NEEDS_REVIEW',
      reason: 'DAILY_LIMIT_EXCEEDED',
      idempotencyKey: `gate:${orderId}:daily`
    });
    return { gated: true, reason: 'DAILY_LIMIT_EXCEEDED' };
  }

  return { gated: false };
}
