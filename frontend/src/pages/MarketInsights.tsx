import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  MapPin,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type MarketPoint = {
  label: string;
  value: number;
};

type DistrictDemand = {
  name: string;
  value: number;
};

type Opportunity = {
  name: string;
  price: number;
  demand: number;
  change: number;
};

type MarketData = {
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
  opportunities: Opportunity[];
  recommendation: string;
  summary: string;
};

const WIRE_DATA: Record<string, MarketData> = {
  Tomato: {
    selected: {
      commodity: "Tomato",
      state: "Tamil Nadu",
      district: "Coimbatore",
      period: "7 Days",
    },
    metrics: {
      current_price: 28,
      demand_score: 84,
      price_change: 8.4,
      market_supply: 1240,
      unit: "kg",
    },
    price_trend: [
      { label: "01 Sep", value: 22 },
      { label: "02 Sep", value: 24 },
      { label: "03 Sep", value: 23 },
      { label: "04 Sep", value: 26 },
      { label: "05 Sep", value: 25 },
      { label: "06 Sep", value: 29 },
      { label: "Today", value: 28 },
    ],
    district_demand: [
      { name: "Coimbatore", value: 92 },
      { name: "Chennai", value: 78 },
      { name: "Madurai", value: 66 },
      { name: "Salem", value: 58 },
    ],
    opportunities: [
      { name: "Tomato", price: 28, demand: 84, change: 8.4 },
      { name: "Onion", price: 32, demand: 91, change: 11.2 },
      { name: "Potato", price: 24, demand: 63, change: 2.1 },
      { name: "Carrot", price: 42, demand: 57, change: 1.8 },
    ],
    recommendation:
      "Demand is strong and prices are trending upward in the selected market.",
    summary:
      "Tomato is showing strong demand in Coimbatore, Tamil Nadu, with a positive price movement over the selected period.",
  },
  Potato: {
    selected: {
      commodity: "Potato",
      state: "Tamil Nadu",
      district: "Coimbatore",
      period: "7 Days",
    },
    metrics: {
      current_price: 24,
      demand_score: 63,
      price_change: 2.1,
      market_supply: 1680,
      unit: "kg",
    },
    price_trend: [
      { label: "01 Sep", value: 19 },
      { label: "02 Sep", value: 20 },
      { label: "03 Sep", value: 21 },
      { label: "04 Sep", value: 22 },
      { label: "05 Sep", value: 23 },
      { label: "06 Sep", value: 25 },
      { label: "Today", value: 24 },
    ],
    district_demand: [
      { name: "Chennai", value: 81 },
      { name: "Coimbatore", value: 69 },
      { name: "Salem", value: 60 },
      { name: "Madurai", value: 48 },
    ],
    opportunities: [
      { name: "Tomato", price: 28, demand: 84, change: 8.4 },
      { name: "Onion", price: 32, demand: 91, change: 11.2 },
      { name: "Potato", price: 24, demand: 63, change: 2.1 },
      { name: "Carrot", price: 42, demand: 57, change: 1.8 },
    ],
    recommendation:
      "Market activity is moderate. Monitor demand before making a larger trade decision.",
    summary:
      "Potato demand is currently moderate in the selected region with a small positive price movement.",
  },
  Onion: {
    selected: {
      commodity: "Onion",
      state: "Tamil Nadu",
      district: "Coimbatore",
      period: "7 Days",
    },
    metrics: {
      current_price: 32,
      demand_score: 91,
      price_change: 11.2,
      market_supply: 980,
      unit: "kg",
    },
    price_trend: [
      { label: "01 Sep", value: 23 },
      { label: "02 Sep", value: 24 },
      { label: "03 Sep", value: 27 },
      { label: "04 Sep", value: 26 },
      { label: "05 Sep", value: 30 },
      { label: "06 Sep", value: 34 },
      { label: "Today", value: 32 },
    ],
    district_demand: [
      { name: "Chennai", value: 96 },
      { name: "Madurai", value: 83 },
      { name: "Coimbatore", value: 76 },
      { name: "Salem", value: 64 },
    ],
    opportunities: [
      { name: "Onion", price: 32, demand: 91, change: 11.2 },
      { name: "Tomato", price: 28, demand: 84, change: 8.4 },
      { name: "Potato", price: 24, demand: 63, change: 2.1 },
      { name: "Carrot", price: 42, demand: 57, change: 1.8 },
    ],
    recommendation:
      "Strong demand and positive price movement make this a high-opportunity commodity.",
    summary:
      "Onion is currently showing the strongest demand signal in the wireframe dataset with a significant positive price movement.",
  },
  Carrot: {
    selected: {
      commodity: "Carrot",
      state: "Tamil Nadu",
      district: "Coimbatore",
      period: "7 Days",
    },
    metrics: {
      current_price: 42,
      demand_score: 57,
      price_change: 1.8,
      market_supply: 760,
      unit: "kg",
    },
    price_trend: [
      { label: "01 Sep", value: 38 },
      { label: "02 Sep", value: 39 },
      { label: "03 Sep", value: 40 },
      { label: "04 Sep", value: 41 },
      { label: "05 Sep", value: 40 },
      { label: "06 Sep", value: 43 },
      { label: "Today", value: 42 },
    ],
    district_demand: [
      { name: "Coimbatore", value: 73 },
      { name: "Salem", value: 64 },
      { name: "Chennai", value: 53 },
      { name: "Madurai", value: 46 },
    ],
    opportunities: [
      { name: "Onion", price: 32, demand: 91, change: 11.2 },
      { name: "Tomato", price: 28, demand: 84, change: 8.4 },
      { name: "Potato", price: 24, demand: 63, change: 2.1 },
      { name: "Carrot", price: 42, demand: 57, change: 1.8 },
    ],
    recommendation:
      "Demand is moderate with limited price movement. Monitor the market before acting.",
    summary:
      "Carrot is showing moderate demand and relatively stable pricing in the selected region.",
  },
};

const commodities = Object.keys(WIRE_DATA);
const states = ["Tamil Nadu", "Karnataka", "Kerala", "Maharashtra"];
const districts = ["Coimbatore", "Chennai", "Madurai", "Salem"];
const periods = ["7 Days", "30 Days", "90 Days"];

function MarketInsights() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGPathElement>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [commodity, setCommodity] = useState("Tomato");
  const [state, setState] = useState("Tamil Nadu");
  const [district, setDistrict] = useState("Coimbatore");
  const [period, setPeriod] = useState("7 Days");

  const data = WIRE_DATA[commodity];

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".market-card", {
        y: 20,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: "power2.out",
      });

      gsap.from(".market-section", {
        y: 18,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        delay: 0.1,
        ease: "power2.out",
      });

      const path = chartRef.current;

      if (path) {
        const length = path.getTotalLength();

        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.3,
          ease: "power2.out",
        });
      }

      barsRef.current.forEach((bar, index) => {
        const item = data.district_demand[index];

        if (!bar || !item) return;

        gsap.fromTo(
          bar,
          { width: 0 },
          {
            width: `${item.value}%`,
            duration: 0.8,
            delay: 0.2 + index * 0.08,
            ease: "power2.out",
          }
        );
      });
    }, pageRef);

    return () => ctx.revert();
  }, [data]);

  const linePath = useMemo(() => {
    const values = data.price_trend.map((item) => item.value);
    const width = 620;
    const height = 220;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;

    return values
      .map((value, index) => {
        const x =
          values.length === 1
            ? width / 2
            : (index / (values.length - 1)) * width;

        const y = height - ((value - min) / range) * 170 - 20;

        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [data]);

  const demandLabel =
    data.metrics.demand_score >= 70
      ? "HIGH"
      : data.metrics.demand_score >= 40
        ? "MEDIUM"
        : "LOW";

  const opportunity =
    data.metrics.demand_score >= 80
      ? "STRONG OPPORTUNITY"
      : data.metrics.demand_score >= 60
        ? "GOOD OPPORTUNITY"
        : "STABLE MARKET";

  const updateCommodity = (value: string) => {
    setCommodity(value);
    setDistrict(WIRE_DATA[value].selected.district);
    setState(WIRE_DATA[value].selected.state);
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#050705] px-5 py-8 text-white sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">
        <button
          onClick={() => {
            if (localStorage.getItem("admin")) {
              navigate("/dashboard");
            } else if (localStorage.getItem("buyer")) {
              navigate("/buyer-dashboard");
            } else {
              navigate("/login");
            }
          }}
          className="market-card mb-7 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="market-card mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-[#39ff14]/70">
              MARKET INTELLIGENCE
            </p>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Market Insights
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
              Preview the complete market intelligence wireframe
              before connecting live data.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-white/40">
            <MapPin size={16} className="text-[#91ad68]" />
            {district}, {state}
          </div>
        </div>

        <div className="market-card mb-7 grid gap-3 rounded-2xl border border-white/[0.07] bg-[#090c09] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <SelectBox
            label="Commodity"
            value={commodity}
            options={commodities}
            onChange={updateCommodity}
          />

          <SelectBox
            label="State"
            value={state}
            options={states}
            onChange={setState}
          />

          <SelectBox
            label="District"
            value={district}
            options={districts}
            onChange={setDistrict}
          />

          <SelectBox
            label="Period"
            value={period}
            options={periods}
            onChange={setPeriod}
          />
        </div>

        <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={<TrendingUp size={19} />}
            label="Current Price"
            value={`₹${data.metrics.current_price}/${data.metrics.unit}`}
            suffix="market price"
          />

          <MetricCard
            icon={<BarChart3 size={19} />}
            label="Demand"
            value={demandLabel}
            suffix={`${data.metrics.demand_score}/100 demand score`}
          />

          <MetricCard
            icon={<ArrowUpRight size={19} />}
            label="Price Change"
            value={`+${data.metrics.price_change}%`}
            suffix={`selected period`}
          />

          <MetricCard
            icon={<Package size={19} />}
            label="Market Supply"
            value={`${data.metrics.market_supply.toLocaleString("en-IN")} ${data.metrics.unit}`}
            suffix="available supply"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <section className="market-section rounded-2xl border border-white/[0.07] bg-[#090c09] p-6 shadow-[8px_8px_20px_rgba(0,0,0,.32)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/25">
                  Price Trend
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {data.selected.commodity}
                </h2>
              </div>

              <span className="rounded-lg border border-[#7f9f5c]/20 bg-[#0d130d] px-3 py-1.5 text-xs text-[#91ad68]">
                {period}
              </span>
            </div>

            <div className="mt-7 overflow-hidden">
              <svg
                viewBox="0 0 620 220"
                className="h-[250px] w-full overflow-visible"
              >
                {[35, 90, 145, 200].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    x2="620"
                    y1={y}
                    y2={y}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                  />
                ))}

                <path
                  ref={chartRef}
                  d={linePath}
                  fill="none"
                  stroke="#91ad68"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-white/20">
              {data.price_trend.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>
          </section>

          <section className="market-section rounded-2xl border border-white/[0.07] bg-[#090c09] p-6 shadow-[8px_8px_20px_rgba(0,0,0,.32)]">
            <p className="text-xs uppercase tracking-[0.18em] text-white/25">
              Demand By District
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {data.selected.commodity}
            </h2>

            <div className="mt-8 space-y-6">
              {data.district_demand.map((item, index) => (
                <div key={item.name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-white/55">
                      {item.name}
                    </span>

                    <span className="text-white/35">
                      {item.value}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#111611]">
                    <div
                      ref={(el) => {
                        barsRef.current[index] = el;
                      }}
                      className="h-full rounded-full bg-[#7f9f5c]"
                      style={{ width: 0 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="market-section mt-6 rounded-2xl border border-white/[0.07] bg-[#090c09] p-6 shadow-[8px_8px_20px_rgba(0,0,0,.32)]">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/25">
              Market Opportunities
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Current commodity signals
            </h2>
          </div>

          <div className="space-y-3">
            {data.opportunities.map((item) => {
              const label =
                item.demand >= 70
                  ? "HIGH DEMAND"
                  : item.demand >= 40
                    ? "MEDIUM DEMAND"
                    : "LOW DEMAND";

              return (
                <div
                  key={item.name}
                  className="flex flex-col gap-4 rounded-xl border border-white/[0.05] bg-[#050705] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d130d] text-[#91ad68]">
                      <Package size={18} />
                    </div>

                    <div>
                      <p className="font-medium">{item.name}</p>

                      <p className="mt-1 text-xs text-white/25">
                        ₹{item.price}/{data.metrics.unit} · {label}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs">
                    <span className="text-white/40">
                      Demand{" "}
                      <span className="text-white/70">
                        {item.demand}/100
                      </span>
                    </span>

                    <span className="text-white/40">
                      Change{" "}
                      <span className="text-[#91ad68]">
                        +{item.change}%
                      </span>
                    </span>

                    <span className="text-[#91ad68]">
                      {item.demand >= 70
                        ? "Strong opportunity"
                        : "Stable market"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="market-section rounded-2xl border border-[#7f9f5c]/15 bg-[#0a0e0a] p-6 shadow-[8px_8px_20px_rgba(0,0,0,.32)]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/25">
              <ShoppingCart
                size={15}
                className="text-[#91ad68]"
              />
              Sell / Buy Signal
            </div>

            <h2 className="mt-4 text-2xl font-semibold">
              {data.selected.commodity}
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <InfoStat label="Demand" value={demandLabel} />

              <InfoStat
                label="Price"
                value={`₹${data.metrics.current_price}`}
              />

              <InfoStat
                label="Supply"
                value={`${data.metrics.market_supply.toLocaleString("en-IN")} ${data.metrics.unit}`}
              />
            </div>

            <div className="mt-6 rounded-xl border border-[#7f9f5c]/15 bg-[#0d130d] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#91ad68]/65">
                Recommendation
              </p>

              <p className="mt-2 text-sm leading-6 text-white/65">
                {data.recommendation}
              </p>
            </div>
          </section>

          <section className="market-section rounded-2xl border border-white/[0.07] bg-[#090c09] p-6 shadow-[8px_8px_20px_rgba(0,0,0,.32)]">
            <p className="text-xs uppercase tracking-[0.18em] text-white/25">
              Market Summary
            </p>

            <h2 className="mt-3 text-xl font-semibold">
              {data.selected.commodity} · {district}
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/40">
              {data.summary}
            </p>

            <div className="mt-6 flex items-center justify-between rounded-xl border border-white/[0.05] bg-[#050705] px-4 py-3">
              <span className="text-sm text-white/35">
                Opportunity
              </span>

              <span className="text-sm font-medium text-[#91ad68]">
                {opportunity}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#050705] px-3 py-2.5">
      <p className="mb-1 text-[10px] uppercase tracking-[0.16em] text-white/20">
        {label}
      </p>

      <div className="flex items-center justify-between">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-transparent text-sm text-white outline-none"
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
              className="bg-[#090c09]"
            >
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none -ml-5 text-white/30"
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="market-card rounded-2xl border border-white/[0.07] bg-[#090c09] p-5 shadow-[8px_8px_18px_rgba(0,0,0,.3)]">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d130d] text-[#91ad68]">
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-[0.14em] text-white/20">
          Market
        </span>
      </div>

      <p className="mt-5 text-xs text-white/30">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-[11px] text-white/20">{suffix}</p>
    </div>
  );
}

function InfoStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#050705] p-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/20">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white/80">
        {value}
      </p>
    </div>
  );
}

export default MarketInsights;
