import { db } from '../db/index.js';
import type { OrderState } from '../models/types.js';

export async function upsertOrder(params: {
  accountId: number;
  shopeeOrderId: string;
  seenAtISO: string;
}) {
  const { accountId, shopeeOrderId, seenAtISO } = params;

  await db.query(
    `
    INSERT INTO orders (account_id, shopee_order_id, state, last_seen_at)
    VALUES ($1, $2, 'NEW', $3)
    ON CONFLICT (account_id, shopee_order_id)
    DO UPDATE SET
      last_seen_at = EXCLUDED.last_seen_at,
      updated_at = now()
    `,
    [accountId, shopeeOrderId, seenAtISO]
  );
}

export async function getOrderById(orderId: number) {
  const res = await db.query(
    `
    SELECT id, account_id, shopee_order_id, state, state_version,
           accepted_at, shipped_at, delivered_at, needs_review_reason
    FROM orders
    WHERE id = $1
    `,
    [orderId]
  );

  return res.rows[0] ?? null;
}

export async function updateOrderStateTx(params: {
  orderId: number;
  expectedStateVersion: number;
  fromState: OrderState;
  toState: OrderState;
  nowISO: string;
  needsReviewReason?: string | null;
}) {
  const {
    orderId,
    expectedStateVersion,
    fromState,
    toState,
    nowISO,
    needsReviewReason
  } = params;

  const acceptedAt = toState === 'ACCEPTED' ? nowISO : null;
  const shippedAt = toState === 'SHIPPED' ? nowISO : null;
  const deliveredAt = toState === 'DELIVERED' ? nowISO : null;

  const res = await db.query(
    `
    UPDATE orders
    SET
      state = $1::order_state,
      state_version = state_version + 1,
      accepted_at = COALESCE(accepted_at, $2),
      shipped_at = COALESCE(shipped_at, $3),
      delivered_at = COALESCE(delivered_at, $4),
      needs_review_reason = CASE
        WHEN $1::order_state = 'NEEDS_REVIEW' THEN $5
        ELSE needs_review_reason
      END,
      updated_at = now()
    WHERE
      id = $6
      AND state = $7::order_state
      AND state_version = $8
    RETURNING id, state, state_version
    `,
    [
      toState,
      acceptedAt,
      shippedAt,
      deliveredAt,
      needsReviewReason ?? null,
      orderId,
      fromState,
      expectedStateVersion
    ]
  );

  return res.rows[0] ?? null;
}
