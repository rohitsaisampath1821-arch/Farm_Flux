export type Admin = {
  sid: number;
  name: string;
  email: string;
};

export type BuyerSession = {
  sid: number;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  district?: string;
  state?: string;
  pincode?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupBuyerPayload = {
  role: "buyer";
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  business_name?: string | null;
  business_type?: string | null;
  location?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
};

export type SignupFarmerPayload = {
  role: "farmer";
  name: string;
  phone?: string | null;
  farm_name?: string | null;
  location?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  farm_size?: number | null;
  farm_size_unit?: string | null;
};

export type SignupPayload =
  | SignupBuyerPayload
  | SignupFarmerPayload;

export type UserRole = "admin" | "buyer" | "farmer";
