import { apiRequest } from "./api";

export type Buyer = {
  sid: number;
  name: string;
  email?: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  district?: string;
  state?: string;
  pincode?: string;
  status?: string;
};

type BuyersResponse = {
  success: boolean;
  buyers: Buyer[];
  message?: string;
};

export async function getBuyers(): Promise<Buyer[]> {
  const data = await apiRequest<BuyersResponse>(
    "/api/buyers"
  );

  return data.buyers ?? [];
}

export async function deleteBuyer(
  sid: number
): Promise<void> {
  await apiRequest(`/api/buyers/${sid}`, {
    method: "DELETE",
  });
}
