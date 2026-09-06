import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Package, ShoppingBag, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type MonthlyData = {
  month: string;
  amount: number;
};

type PercentageData = {
  name: string;
  percentage: number;
};

type ProductData = {
  name: string;
  quantity: number;
};

type OrderData = {
  sid: number;
  order_date: string;
  total_amount: number;
  status: string;
  item_count?: number;
};

type Analytics = {
  summary: {
    total_spent: number;
    total_orders: number;
    total_quantity: number;
    average_order: number;
  };
  monthly_spending: MonthlyData[];
  categories: PercentageData[];
  top_products: ProductData[];
  order_status: PercentageData[];
  recent_orders: OrderData[];
};

const emptyData: Analytics = {
  summary: {
    total_spent: 0,
    total_orders: 0,
    total_quantity: 0,
    average_order: 0,
  },
  monthly_spending: [],
  categories: [],
  top_products: [],
  order_status: [],
  recent_orders: [],
};

function formatMoney(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "delivered":
      return "text-[#91b36c]";
    case "cancelled":
      return "text-red-400";
    case "shipped":
      return "text-blue-300";
    default:
      return "text-white/55";
  }
}

function DonutChart({
  data,
  centerText,
}: {
  data: PercentageData[];
  centerText: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const segmentsRef = useRef<(SVGCircleElement | null)[]>([]);

  const radius = 76;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    let accumulated = 0;

    return data.map((item) => {
      const length = (item.percentage / 100) * circumference;
      const offset = -accumulated;
      accumulated += length;

      return {
        ...item,
        length,
        offset,
      };
    });
  }, [data, circumference]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      segmentsRef.current.forEach((segment, index) => {
        if (!segment) return;

        const item = segments[index];

        gsap.set(segment, {
          strokeDasharray: `0 ${circumference}`,
          strokeDashoffset: circumference * 0.25 + item.offset,
        });

        gsap.to(segment, {
          strokeDasharray: `${item.length} ${circumference - item.length}`,
          duration: 1.2,
          delay: index * 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: svgRef.current,
            start: "top 82%",
            once: true,
          },
        });
      });
    }, svgRef);

    return () => ctx.revert();
  }, [segments, circumference]);

  return (
    <div className="relative flex h-52 w-52 items-center justify-center">
      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="h-full w-full -rotate-0"
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="22"
        />

        {segments.map((item, index) => (
          <circle
            key={item.name}
            ref={(el) => {
              segmentsRef.current[index] = el;
            }}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            strokeWidth="22"
            strokeLinecap="butt"
            stroke={`hsl(${115 + index * 35}, ${35 + index * 8}%, ${
              50 + index * 4
            }%)`}
          />
        ))}
      </svg>

      <div className="absolute text-center">
        <div className="text-2xl font-semibold text-white">{centerText}</div>
        <div className="mt-1 text-xs text-white/35">Purchase mix</div>
      </div>
    </div>
  );
}

export default function MyPurchases() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<Analytics>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chartRef = useRef<HTMLDivElement | null>(null);

  const buyer = useMemo(() => {
    const stored = localStorage.getItem("buyer");

    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!buyer?.sid) {
      setError("Buyer session not found.");
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `http://127.0.0.1:8000/api/buyers/${buyer.sid}/analytics`
        );

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.message || "Unable to load purchase analytics");
        }

        setAnalytics(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load purchase analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [buyer?.sid]);

  useEffect(() => {
    if (loading || !analytics.monthly_spending.length) return;

    const ctx = gsap.context(() => {
      const bars = gsap.utils.toArray<HTMLElement>(".bar-fill");

      gsap.set(bars, {
        height: "0%",
      });

      gsap.to(bars, {
        height: (index) => {
          const max = Math.max(
            ...analytics.monthly_spending.map((item) => item.amount),
            1
          );

          return `${
            (analytics.monthly_spending[index].amount / max) * 100
          }%`;
        },
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: chartRef.current,
          start: "top 82%",
          once: true,
        },
      });
    }, chartRef);

    return () => ctx.revert();
  }, [analytics.monthly_spending, loading]);

  const maxProductQuantity = Math.max(
    ...analytics.top_products.map((item) => item.quantity),
    1
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101411] px-8 py-10 text-white">
        <div className="mx-auto max-w-[1380px]">
          <div className="h-7 w-48 animate-pulse rounded bg-white/[0.05]" />
          <div className="mt-8 grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.025]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101411] text-white">
      <main className="mx-auto max-w-[1380px] px-7 py-7 lg:px-9">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="mb-4 flex items-center gap-2 text-sm text-white/40 transition hover:text-white/75"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>

            <h1 className="text-2xl font-semibold tracking-tight">
              My Purchases
            </h1>

            <p className="mt-1 text-sm text-white/35">
              Your purchasing activity and transaction history
            </p>
          </div>

          <button
            onClick={() => navigate("/products")}
            className="rounded-xl border border-[#7f9f5c]/35 bg-[#7f9f5c] px-5 py-2.5 text-sm font-medium text-[#101411] shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_5px_15px_rgba(127,159,92,.12)] transition hover:-translate-y-0.5"
          >
            Browse Marketplace
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-5 grid grid-cols-4 gap-4">
          <Metric
            title="Total Spent"
            value={formatMoney(analytics.summary.total_spent)}
            icon={<TrendingUp size={17} />}
          />

          <Metric
            title="Total Orders"
            value={analytics.summary.total_orders.toLocaleString("en-IN")}
            icon={<ShoppingBag size={17} />}
          />

          <Metric
            title="Items Bought"
            value={`${analytics.summary.total_quantity.toLocaleString(
              "en-IN"
            )}`}
            icon={<Package size={17} />}
          />

          <Metric
            title="Average Order"
            value={formatMoney(analytics.summary.average_order)}
            icon={<TrendingUp size={17} />}
          />
        </section>

        <section className="grid grid-cols-[1.65fr_1fr] gap-5">
          <div
            ref={chartRef}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <div className="mb-7">
              <h2 className="text-[15px] font-medium text-white/85">
                Monthly Spending
              </h2>
              <p className="mt-1 text-xs text-white/30">
                Amount spent across your purchases
              </p>
            </div>

            <div className="flex h-64 items-end gap-5">
              {analytics.monthly_spending.map((item) => {
                const max = Math.max(
                  ...analytics.monthly_spending.map((value) => value.amount),
                  1
                );

                const percentage = (item.amount / max) * 100;

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div className="mb-2 text-[11px] text-white/30">
                      {formatMoney(item.amount)}
                    </div>

                    <div className="flex h-[78%] w-full items-end">
                      <div
                        className="bar-fill w-full rounded-t-lg bg-[#7f9f5c]"
                        style={{
                          height: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 text-xs text-white/35">
                      {item.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-3">
              <h2 className="text-[15px] font-medium text-white/85">
                Purchase Categories
              </h2>
              <p className="mt-1 text-xs text-white/30">
                Distribution of your purchases
              </p>
            </div>

            <div className="flex items-center justify-center">
              <DonutChart
                data={analytics.categories}
                centerText={`${analytics.categories.reduce(
                  (sum, item) => sum + item.percentage,
                  0
                )}%`}
              />
            </div>

            <div className="space-y-3">
              {analytics.categories.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background: `hsl(${115 + index * 35}, ${
                          35 + index * 8
                        }%, ${50 + index * 4}%)`,
                      }}
                    />
                    <span className="text-white/55">{item.name}</span>
                  </div>

                  <span className="text-white/75">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-[1.65fr_1fr] gap-5">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-7">
              <h2 className="text-[15px] font-medium text-white/85">
                Top Purchased Products
              </h2>
              <p className="mt-1 text-xs text-white/30">
                Products you purchase most frequently
              </p>
            </div>

            <div className="space-y-5">
              {analytics.top_products.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-white/65">
                      {item.name}
                    </span>

                    <span className="text-xs text-white/35">
                      {item.quantity} units
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="bar-fill h-full rounded-full bg-[#7f9f5c]"
                      style={{
                        width: `${
                          (item.quantity / maxProductQuantity) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-7">
              <h2 className="text-[15px] font-medium text-white/85">
                Order Status
              </h2>
              <p className="mt-1 text-xs text-white/30">
                Current distribution of orders
              </p>
            </div>

            <div className="space-y-5">
              {analytics.order_status.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-white/55">
                      {item.name}
                    </span>

                    <span className="text-sm text-white/75">
                      {item.percentage}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="percentage-fill h-full rounded-full bg-[#7f9f5c]"
                      style={{ width: "0%" }}
                      data-target={item.percentage}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <h2 className="text-[15px] font-medium text-white/85">
              Recent Purchases
            </h2>
            <p className="mt-1 text-xs text-white/30">
              Your latest transactions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-xs text-white/25">
                  <th className="px-6 py-4 font-medium">Order</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Items</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {analytics.recent_orders.map((order) => (
                  <tr
                    key={order.sid}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="px-6 py-4 text-sm text-white/65">
                      #{order.sid}
                    </td>

                    <td className="px-6 py-4 text-sm text-white/40">
                      {formatDate(order.order_date)}
                    </td>

                    <td className="px-6 py-4 text-sm text-white/40">
                      {order.item_count ?? "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-white/70">
                      {formatMoney(order.total_amount)}
                    </td>

                    <td
                      className={`px-6 py-4 text-sm capitalize ${statusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </td>
                  </tr>
                ))}

                {!analytics.recent_orders.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-white/25"
                    >
                      No purchases yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/35">{title}</span>

        <span className="text-[#7f9f5c]">{icon}</span>
      </div>

      <div className="mt-4 text-xl font-semibold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}