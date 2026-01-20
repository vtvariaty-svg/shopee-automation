import { db } from '../db/index.js';

export async function getShopeeCredentials(accountId: number) {
  const res = await db.query(
    `
    SELECT partner_id, partner_key, shop_id, access_token, region
    FROM accounts_shopee_credentials
    WHERE account_id = $1
    `,
    [accountId]
  );

  return res.rows[0] ?? null;
}
