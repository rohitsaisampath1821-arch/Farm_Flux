import { apiRequest } from "./api";

export type ActivityPayload = {
  user_type: "buyer" | "farmer" | "admin";
  user_sid: number;
  activity_type: string;
  reference_sid?: number | null;
  metadata?: string | null;
};

export type ActivityResponse = {
  success: boolean;
  activity?: {
    sid: number;
  };
  message?: string;
};

export async function createActivity(
  payload: ActivityPayload
): Promise<ActivityResponse> {
  return apiRequest<ActivityResponse>(
    "/api/activity",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}
