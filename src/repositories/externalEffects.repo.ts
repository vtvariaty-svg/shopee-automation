import { db } from '../db/index.js';

export async function registerExternalEffect(params: {
  orderId: number;
  effectType: string;
  effectKey: string;
  payload?: unknown;
}) {
  const { orderId, effectType, effectKey, payload } = params;

  await db.query(
    `
    INSERT INTO external_effects (order_id, effect_type, effect_key, payload_ref)
    VALUES ($1, $2, $3, $4)
    `,
    [orderId, effectType, effectKey, payload ?? null]
  );
}
