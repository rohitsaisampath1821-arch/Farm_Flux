import { apiRequest } from "./api";

export type MarketPoint = {
  label: string;
  value: number;
};

export type DistrictDemand = {
  name: string;
  value: number;
};

export type CommodityOpportunity = {
  name: string;
  price: number;
  demand: number;
  change: number;
};

export type MarketInsights = {
  success: boolean;
  filters: {
    commodities: string[];
    states: string[];
    districts: string[];
    periods: string[];
  };
  selected: {
    commodity: string;
    state: string;
    district: string;
    period: string;
  };
  metrics: {
    current_price: number;
    demand_score: number;
    price_change: number;
    market_supply: number;
    unit: string;
  };
  price_trend: MarketPoint[];
  district_demand: DistrictDemand[];
  opportunities: CommodityOpportunity[];
  recommendation: string;
  summary: string;
  message?: string;
};

export type MarketInsightFilters = {
  commodity?: string;
  state?: string;
  district?: string;
  period?: string;
};

export async function getMarketInsights(
  filters: MarketInsightFilters = {}
): Promise<MarketInsights> {
  const params = new URLSearchParams();

  if (filters.commodity) {
    params.set("commodity", filters.commodity);
  }

  if (filters.state) {
    params.set("state", filters.state);
  }

  if (filters.district) {
    params.set("district", filters.district);
  }

  if (filters.period) {
    params.set("period", filters.period);
  }

  const query = params.toString();

  return apiRequest<MarketInsights>(
    `/api/market-insights${query ? `?${query}` : ""}`
  );
}
