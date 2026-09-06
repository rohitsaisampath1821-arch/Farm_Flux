import { apiRequest } from "./api";

export type Farmer = {
  sid: number;
  name: string;
  phone?: string;
  farm_name?: string;
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farm_size?: number;
  farm_size_unit?: string;
  status?: string;
};

type FarmersResponse = {
  success: boolean;
  farmers: Farmer[];
  message?: string;
};

export async function getFarmers(): Promise<Farmer[]> {
  const data = await apiRequest<FarmersResponse>(
    "/api/farmers"
  );

  return data.farmers ?? [];
}

export async function deleteFarmer(
  sid: number
): Promise<void> {
  await apiRequest(`/api/farmers/${sid}`, {
    method: "DELETE",
  });
}
