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
