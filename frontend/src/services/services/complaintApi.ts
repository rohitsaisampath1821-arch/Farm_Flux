import { apiRequest } from "./api";

export type ComplaintPayload = {
  user_type: "buyer" | "farmer";
  user_sid: number;
  category: string;
  subject: string;
  description: string;
};

export type Complaint = {
  sid: number;
  user_type: string;
  user_sid: number;
  category: string;
  subject: string;
  description: string;
  status: string;
  admin_response?: string | null;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string | null;
};

export type ComplaintCreateResponse = {
  success: boolean;
  message: string;
  complaint?: {
    sid: number;
  };
};

export type ComplaintsResponse = {
  success: boolean;
  complaints: Complaint[];
  message?: string;
};

export async function createComplaint(
  payload: ComplaintPayload
): Promise<ComplaintCreateResponse> {
  return apiRequest<ComplaintCreateResponse>(
    "/api/complaints",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getComplaints(): Promise<Complaint[]> {
  const data = await apiRequest<ComplaintsResponse>(
    "/api/complaints"
  );

  return data.complaints ?? [];
}
