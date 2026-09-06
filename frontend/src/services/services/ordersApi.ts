import { apiRequest } from "./api";

export type OrderItemPayload = {
  product_sid: number;
  quantity: number;
};

export type CreateOrderPayload = {
  buyer_sid: number;
  delivery_address: string;
  items: OrderItemPayload[];
};

export type CreateOrderResponse = {
  success: boolean;
  message: string;
  order?: {
    sid: number;
    buyer_sid: number;
    total_amount: number;
    status: string;
  };
};

export async function createOrder(
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> {
  return apiRequest<CreateOrderResponse>(
    "/api/orders",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
