export type OrderItem = {
  product_sid: number;
  quantity: number;
};

export type CreateOrderPayload = {
  buyer_sid: number;
  delivery_address: string;
  items: OrderItem[];
};

export type CreatedOrder = {
  sid: number;
  buyer_sid: number;
  total_amount: number;
  status: string;
};

export type CreateOrderResponse = {
  success: boolean;
  message: string;
  order?: CreatedOrder;
};

export type RecentOrder = {
  sid: number;
  order_date: string | null;
  total_amount: number;
  status: string;
  item_count: number;
};
