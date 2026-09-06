export type ComplaintUserType =
  | "buyer"
  | "farmer";

export type ComplaintPayload = {
  user_type: ComplaintUserType;
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
