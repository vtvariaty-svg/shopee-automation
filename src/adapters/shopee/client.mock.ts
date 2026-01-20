import { ShopeeClient, FetchOrdersParams, ShopeeOrder } from './types.js';

/**
 * Adapter MOCKADO.
 * NÃO usa token.
 * NÃO chama API externa.
 * Retorna dados determinísticos para validar polling + UPSERT.
 */
export class ShopeeMockClient implements ShopeeClient {
  async fetchOrders(params: FetchOrdersParams): Promise<ShopeeOrder[]> {
    const baseTime = new Date(params.windowStartISO).getTime();

    return [
      {
        shopee_order_id: `MOCK-${baseTime}-A`,
        created_at: new Date(baseTime).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        shopee_order_id: `MOCK-${baseTime}-B`,
        created_at: new Date(baseTime + 1000).toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}
