import { apiRequest } from "./api";

export type MonthlySpending = {
  month: string;
  amount: number;
};

export type CategoryMetric = {
  name: string;
  percentage: number;
};

export type TopProductMetric = {
  name: string;
  quantity: number;
};

export type ActivityMetric = {
  name: string;
  count: number;
};

export type MonthlyActivity = {
  month: string;
  activity_count: number;
};

export type RecentOrder = {
  sid: number;
  order_date: string | null;
  total_amount: number;
  status: string;
  item_count: number;
};

export type BuyerAnalytics = {
  success: boolean;
  buyer: {
    sid: number;
    name: string;
  };
  summary: {
    total_spent: number;
    total_orders: number;
    total_quantity: number;
    average_order: number;
    total_activity: number;
  };
  monthly_spending: MonthlySpending[];
  categories: CategoryMetric[];
  top_products: TopProductMetric[];
  order_status: CategoryMetric[];
  activity_summary: ActivityMetric[];
  monthly_activity: MonthlyActivity[];
  recent_orders: RecentOrder[];
  message?: string;
};

export async function getBuyerAnalytics(
  buyerSid: number
): Promise<BuyerAnalytics> {
  return apiRequest<BuyerAnalytics>(
    `/api/buyers/${buyerSid}/analytics`
  );
}
