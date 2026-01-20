import { db } from '../db/index.js';
import { getShopeeCredentials } from '../repositories/credentials.repo.js';
import { registerExternalEffect } from '../repositories/externalEffects.repo.js';
import { transitionOrder } from './orderState.service.js';
import { shopeeAcceptOrder } from '../adapters/shopee/accept.js';
import { assertKillSwitch } from '../guards/killSwitch.js';

export async function acceptOrder(params: {
  orderId: number;
  accountId: number;
  shopeeOrderSn: string;
}) {
  const { orderId, accountId, shopeeOrderSn } = params;

  // Kill switch HARD
  await assertKillSwitch(accountId);

  const creds = await getShopeeCredentials(accountId);
  if (!creds) {
    throw new Error('MISSING_SHOPEE_CREDENTIALS');
  }

  const effectKey = `shopee:accept:${accountId}:${orderId}`;

  // Dedup externo (se já aceitou, não repete)
  await registerExternalEffect({
    orderId,
    effectType: 'ACCEPT',
    effectKey
  });

  // Ação externa (se falhar, a transação interna NÃO roda)
  await shopeeAcceptOrder({
    region: creds.region,
    accessToken: creds.access_token,
    shopId: creds.shop_id,
    orderSn: shopeeOrderSn
  });

  // Transição interna SÓ após sucesso externo
  await transitionOrder({
    orderId,
    toState: 'ACCEPTED',
    idempotencyKey: `accept:${orderId}`
  });
}
