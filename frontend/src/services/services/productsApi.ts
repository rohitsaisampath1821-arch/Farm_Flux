import { apiRequest } from "./api";

export type Product = {
  sid: number;
  product_name: string;
  category: string;
  description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  harvest_date?: string;
  expiry_date?: string;
  quality_grade?: string;
  image_url?: string;
  status?: string;
  farmer_name?: string;
  farmer_sid?: number;
};

export type ProductListResponse = {
  success: boolean;
  products: Product[];
  message?: string;
};

export type ProductCreatePayload = {
  product_name: string;
  category: string;
  description?: string | null;
  quantity: number;
  unit: string;
  price_per_unit: number;
  harvest_date?: string | null;
  expiry_date?: string | null;
  quality_grade?: string | null;
  image_url?: string | null;
  farmer_sid: number;
};

export async function getProducts(): Promise<Product[]> {
  const data = await apiRequest<ProductListResponse>(
    "/api/products"
  );

  return data.products ?? [];
}

export async function getAdminProducts(): Promise<Product[]> {
  const data = await apiRequest<ProductListResponse>(
    "/api/admin/products"
  );

  return data.products ?? [];
}

export async function createProduct(
  payload: ProductCreatePayload
): Promise<unknown> {
  return apiRequest("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(
  sid: number
): Promise<void> {
  await apiRequest(`/api/products/${sid}`, {
    method: "DELETE",
  });
}
