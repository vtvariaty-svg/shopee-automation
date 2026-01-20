import type { OrderState } from '../models/types.js';

const allowed: Record<OrderState, OrderState[]> = {
  NEW: ['ACCEPTED', 'NEEDS_REVIEW'],
  ACCEPTED: ['SHIPPED', 'NEEDS_REVIEW'],
  SHIPPED: ['DELIVERED', 'NEEDS_REVIEW'],
  DELIVERED: [],
  NEEDS_REVIEW: [] // bloqueia automação; só humano pode "resolver" no futuro (não nesta fase)
};

export function assertValidTransition(from: OrderState, to: OrderState) {
  const next = allowed[from] ?? [];
  if (!next.includes(to)) {
    throw new Error(`INVALID_TRANSITION:${from}->${to}`);
  }
}

export function isTerminal(state: OrderState) {
  return state === 'DELIVERED';
}
