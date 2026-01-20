export interface ShopeeOrder {
  shopee_order_id: string;
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface FetchOrdersParams {
  windowStartISO: string;
  windowEndISO: string;
}

export interface ShopeeClient {
  fetchOrders(params: FetchOrdersParams): Promise<ShopeeOrder[]>;
}
