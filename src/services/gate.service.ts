import { getBacklogCount, getTodayOrdersCount } from '../repositories/metrics.repo.js';
import { transitionOrder } from './orderState.service.js';
import { logger } from '../logger.js';

const MAX_BACKLOG = 5;
const MAX_DAILY = 20;

export async function gateOrder(params: {
  orderId: number;
  accountId: number;
}) {
  const { orderId, accountId } = params;

  const backlog = await getBacklogCount(accountId);
  const today = await getTodayOrdersCount(accountId);

  logger.info('GATE_METRICS', { orderId, accountId, backlog, today });

  // Regra dura: backlog NÃO pode ultrapassar 5
  // Se backlog já está >= 5, o próximo pedido deve ir para NEEDS_REVIEW
  if (backlog >= MAX_BACKLOG) {
    await transitionOrder({
      orderId,
      toState: 'NEEDS_REVIEW',
      reason: 'BACKLOG_LIMIT_EXCEEDED',
      idempotencyKey: `gate:${orderId}:backlog_limit_exceeded`
    });
    return { gated: true, reason: 'BACKLOG_LIMIT_EXCEEDED' };
  }

  // Regra dura: limite diário NÃO pode ultrapassar 20
  if (today >= MAX_DAILY) {
    await transitionOrder({
      orderId,
      toState: 'NEEDS_REVIEW',
      reason: 'DAILY_LIMIT_EXCEEDED',
      idempotencyKey: `gate:${orderId}:daily_limit_exceeded`
    });
    return { gated: true, reason: 'DAILY_LIMIT_EXCEEDED' };
  }

  return { gated: false };
}
