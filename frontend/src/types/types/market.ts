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

export type MarketFilters = {
  commodities: string[];
  states: string[];
  districts: string[];
  periods: string[];
};

export type MarketSelection = {
  commodity: string;
  state: string;
  district: string;
  period: string;
};

export type MarketMetrics = {
  current_price: number;
  demand_score: number;
  price_change: number;
  market_supply: number;
  unit: string;
};

export type MarketInsights = {
  success: boolean;
  filters: MarketFilters;
  selected: MarketSelection;
  metrics: MarketMetrics;
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
