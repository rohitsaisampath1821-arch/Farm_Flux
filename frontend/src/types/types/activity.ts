export type UserType =
  | "buyer"
  | "farmer"
  | "admin";

export type ActivityPayload = {
  user_type: UserType;
  user_sid: number;
  activity_type: string;
  reference_sid?: number | null;
  metadata?: string | null;
};

export type Activity = {
  sid: number;
  user_type: UserType;
  user_sid: number;
  activity_type: string;
  reference_sid?: number | null;
  metadata?: string | null;
  created_at?: string;
};
