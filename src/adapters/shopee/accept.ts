import { shopeePost } from './http.js';

export async function shopeeAcceptOrder(params: {
  region: string;
  accessToken: string;
  shopId: string;
  orderSn: string;
}) {
  const { region, accessToken, shopId, orderSn } = params;

  const url = `https://${region}.openapi.shopee.com/v2/order/accept`;

  return shopeePost(
    url,
    {
      shop_id: shopId,
      order_sn: orderSn
    },
    {
      Authorization: `Bearer ${accessToken}`
    }
  );
}
