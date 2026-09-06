import { apiRequest } from "./api";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupPayload =
  | {
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
    }
  | {
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

export type AdminLoginResponse = {
  success: boolean;
  message: string;
  admin?: {
    sid: number;
    name: string;
    email: string;
  };
};

export type BuyerLoginResponse = {
  success: boolean;
  message: string;
  buyer?: {
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
};

export type SignupResponse = {
  success: boolean;
  message: string;
  role?: "buyer" | "farmer";
  user?: {
    sid: number;
    name: string;
    email?: string;
  };
};

export async function adminLogin(
  credentials: LoginCredentials
): Promise<AdminLoginResponse> {
  return apiRequest<AdminLoginResponse>(
    "/api/auth/admin/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
}

export async function buyerLogin(
  credentials: LoginCredentials
): Promise<BuyerLoginResponse> {
  return apiRequest<BuyerLoginResponse>(
    "/api/auth/buyer/login",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    }
  );
}

export async function signup(
  payload: SignupPayload
): Promise<SignupResponse> {
  return apiRequest<SignupResponse>(
    "/api/auth/signup",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
