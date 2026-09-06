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

export type BuyerAnalyticsSummary = {
  total_spent: number;
  total_orders: number;
  total_quantity: number;
  average_order: number;
  total_activity: number;
};

export type BuyerAnalytics = {
  success: boolean;
  buyer: {
    sid: number;
    name: string;
  };
  summary: BuyerAnalyticsSummary;
  monthly_spending: MonthlySpending[];
  categories: CategoryMetric[];
  top_products: TopProductMetric[];
  order_status: CategoryMetric[];
  activity_summary: ActivityMetric[];
  monthly_activity: MonthlyActivity[];
  recent_orders: RecentOrder[];
  message?: string;
};

export type AnalyticsMetricCard = {
  label: string;
  value: string | number;
  suffix?: string;
};
