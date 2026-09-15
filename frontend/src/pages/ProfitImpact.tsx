import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type ProfitHistory = {
  month: string;
  quantity: number;
  traditional_income: number;
  direct_income: number;
  benefit: number;
  benefit_percentage: number;
};

export default function ProfitImpact() {
  const [quantity, setQuantity] = useState(500);
  const [traditionalPrice, setTraditionalPrice] = useState(28);
  const [directPrice, setDirectPrice] = useState(31);
  const [transportCost, setTransportCost] = useState(800);

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ProfitHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [scenario, setScenario] = useState<{
    traditional: number;
    kisanmitra: number;
  } | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  const comparisonData = history.map((item) => ({
    period: item.month,
    traditional: item.traditional_income,
    kisanmitra: item.direct_income,
  }));

  // ==========================================
  // SAMPLE VALUES
  // ==========================================

  const useSampleValues = () => {
    setQuantity(500);
    setTraditionalPrice(28);
    setDirectPrice(31);
    setTransportCost(800);
    setResult(null);
  };

  // ==========================================
  // PROFIT HISTORY API
  // ==========================================

  useEffect(() => {
    const fetchProfitHistory = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/profit/history"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profit history");
        }

        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Profit history error:", error);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchProfitHistory();
  }, []);

  // ==========================================
  // PARTICLE ANIMATION
  // SAME STYLE AS PRODUCTS PAGE
  // ==========================================

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!particlesRef.current) return;

      const particles =
        particlesRef.current.querySelectorAll(
          ".profit-particle"
        );

      particles.forEach((particle) => {
        gsap.set(particle, {
          left: gsap.utils.random(1, 99) + "%",
          top:
            window.innerHeight +
            gsap.utils.random(0, 300),
          scale: gsap.utils.random(0.8, 1.8),
          opacity: gsap.utils.random(0.35, 0.8),
        });

        gsap.to(particle, {
          y: gsap.utils.random(
            -window.innerHeight - 200,
            -window.innerHeight
          ),
          x: gsap.utils.random(-120, 120),
          opacity: 0,
          duration: gsap.utils.random(7, 13),
          repeat: -1,
          delay: gsap.utils.random(0, 8),
          ease: "none",
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // ==========================================
  // PAGE ENTRANCE ANIMATION
  // ==========================================

  useEffect(() => {
    if (!contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".profit-header",
        {
          opacity: 0,
          y: -25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".profit-section",
        {
          opacity: 0,
          y: 35,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.15,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".profit-card",
        {
          opacity: 0,
          y: 30,
          scale: 0.97,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.07,
          delay: 0.25,
          ease: "power2.out",
        }
      );
    }, contentRef);

    return () => ctx.revert();
  }, []);

  // ==========================================
  // CHART ANIMATION
  // ==========================================

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = gsap.context(() => {
      const lines =
        chartRef.current!.querySelectorAll(".chart-line");

      const dots =
        chartRef.current!.querySelectorAll(".data-dot");

      gsap.set(lines, {
        strokeDasharray: 1000,
        strokeDashoffset: 1000,
      });

      gsap.set(dots, {
        opacity: 0,
        scale: 0,
        transformOrigin: "center",
      });

      const tl = gsap.timeline();

      tl.to(lines, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "power2.out",
      }).to(
        dots,
        {
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          duration: 0.4,
          ease: "back.out(2)",
        },
        "-=0.8"
      );
    }, chartRef);

    return () => ctx.revert();
  }, [history]);

  // ==========================================
  // API
  // ==========================================

  const calculateProfit = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/profit/impact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity,
            traditional_price: traditionalPrice,
            direct_price: directPrice,
            transport_cost: transportCost,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Profit API failed");
      }

      const data = await response.json();

      setResult(data);

      // Add the calculator result as a temporary "What-If" scenario.
      // This does NOT modify the MySQL historical data.
      setScenario({
        traditional: quantity * traditionalPrice,
        kisanmitra:
          quantity * directPrice - transportCost,
      });
    } catch (error) {
      console.error("Profit API error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHART
  // ==========================================

  const chartWidth = 900;
  const chartHeight = 350;

  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 50;

  const scenarioData = scenario
    ? {
        period: "Scenario",
        traditional: scenario.traditional,
        kisanmitra: scenario.kisanmitra,
      }
    : null;

  // Historical points remain from MySQL.
  // The scenario is displayed as an additional point after the history.
  const chartData = scenarioData
    ? [...comparisonData, scenarioData]
    : comparisonData;

  const chartValues = chartData.flatMap((item) => [
    item.traditional,
    item.kisanmitra,
  ]);

  const rawMinValue =
    chartValues.length > 0 ? Math.min(...chartValues) : 0;
  const rawMaxValue =
    chartValues.length > 0 ? Math.max(...chartValues) : 1000;

  const chartRange = Math.max(rawMaxValue - rawMinValue, 1000);
  const minValue =
    Math.max(
      0,
      Math.floor((rawMinValue - chartRange * 0.1) / 500) * 500
    );
  const maxValue =
    Math.ceil((rawMaxValue + chartRange * 0.1) / 500) * 500;

  const getX = (index: number) => {
    if (chartData.length <= 1) {
      return chartWidth / 2;
    }

    return (
      paddingLeft +
      (index *
        (chartWidth - paddingLeft - paddingRight)) /
        (chartData.length - 1)
    );
  };

  const getY = (value: number) => {
    const range = Math.max(maxValue - minValue, 1);

    return (
      paddingTop +
      ((maxValue - value) / range) *
        (chartHeight - paddingTop - paddingBottom)
    );
  };

  const traditionalPoints = comparisonData
    .map(
      (item, index) =>
        `${getX(index)},${getY(item.traditional)}`
    )
    .join(" ");

  const kisanmitraPoints = comparisonData
    .map(
      (item, index) =>
        `${getX(index)},${getY(item.kisanmitra)}`
    )
    .join(" ");

  const gridStep = Math.max(
    500,
    Math.ceil((maxValue - minValue) / 4 / 500) * 500
  );

  const gridValues: number[] = [];

  for (
    let value = Math.ceil(minValue / gridStep) * gridStep;
    value <= maxValue;
    value += gridStep
  ) {
    gridValues.push(value);
  }

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050705] text-white"
    >
      {/* ======================================
          FLOATING PARTICLES
      ====================================== */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, index) => (
          <span
            key={index}
            className="profit-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      {/* ======================================
          BACKGROUND RADIAL GLOW
      ====================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(40,80,35,.08),transparent_45%)]" />

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <main
        ref={contentRef}
        className="relative z-10 mx-auto min-h-screen max-w-[1450px] px-5 py-8 sm:px-8 lg:px-12"
      >
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="profit-header mb-10">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
            KISANMITRA ANALYTICS
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Farmer Profit Impact
          </h1>

          <p className="mt-2 max-w-xl text-sm text-white/45">
            Compare traditional selling with direct
            farm-to-buyer selling through KisanMitra.
          </p>
        </div>

        {/* ======================================
            INPUT SECTION
        ====================================== */}

        <section className="profit-section mb-8">
          <div className="rounded-3xl border border-white/[0.05] bg-[#090c09] p-6 shadow-[10px_10px_25px_rgba(0,0,0,.45),-4px_-4px_12px_rgba(255,255,255,.015)]">

            <div className="mb-6">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#39ff14]/70">
                PROFIT CALCULATOR
              </p>

              <h2 className="mt-1 text-xl font-semibold text-white">
                Profit Scenario Calculator
              </h2>

              <p className="mt-1 text-xs text-white/30">
                Adjust the values below to compare farmer
                realization.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              {/* QUANTITY */}

              <div className="profit-card">
                <label className="mb-2 block text-xs font-medium text-white/45">
                  Quantity
                  <span className="ml-1 text-[#39ff14]/70">
                    (kg)
                  </span>
                </label>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Number(e.target.value))
                  }
                  className="w-full rounded-xl border border-white/[0.07] bg-[#050605] px-4 py-3 text-sm text-white/80 outline-none shadow-[inset_4px_4px_10px_rgba(0,0,0,.5)] transition-all focus:border-[#39ff14]/30"
                />

                <p className="mt-2 text-[11px] text-white/25">
                  Example: 500 kg of produce
                </p>
              </div>

              {/* TRADITIONAL PRICE */}

              <div className="profit-card">
                <label className="mb-2 block text-xs font-medium text-white/45">
                  Traditional Price
                  <span className="ml-1 text-[#39ff14]/70">
                    (₹/kg)
                  </span>
                </label>

                <input
                  type="number"
                  value={traditionalPrice}
                  onChange={(e) =>
                    setTraditionalPrice(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-white/[0.07] bg-[#050605] px-4 py-3 text-sm text-white/80 outline-none shadow-[inset_4px_4px_10px_rgba(0,0,0,.5)] transition-all focus:border-[#39ff14]/30"
                />

                <p className="mt-2 text-[11px] text-white/25">
                  Example: ₹28/kg traditional selling
                </p>
              </div>

              {/* KISANMITRA PRICE */}

              <div className="profit-card">
                <label className="mb-2 block text-xs font-medium text-white/45">
                  KisanMitra Price
                  <span className="ml-1 text-[#39ff14]/70">
                    (₹/kg)
                  </span>
                </label>

                <input
                  type="number"
                  value={directPrice}
                  onChange={(e) =>
                    setDirectPrice(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-white/[0.07] bg-[#050605] px-4 py-3 text-sm text-white/80 outline-none shadow-[inset_4px_4px_10px_rgba(0,0,0,.5)] transition-all focus:border-[#39ff14]/30"
                />

                <p className="mt-2 text-[11px] text-white/25">
                  Example: ₹31/kg direct selling
                </p>
              </div>

              {/* TRANSPORT */}

              <div className="profit-card">
                <label className="mb-2 block text-xs font-medium text-white/45">
                  Transport Cost
                  <span className="ml-1 text-[#39ff14]/70">
                    (₹)
                  </span>
                </label>

                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) =>
                    setTransportCost(
                      Number(e.target.value)
                    )
                  }
                  className="w-full rounded-xl border border-white/[0.07] bg-[#050605] px-4 py-3 text-sm text-white/80 outline-none shadow-[inset_4px_4px_10px_rgba(0,0,0,.5)] transition-all focus:border-[#39ff14]/30"
                />

                <p className="mt-2 text-[11px] text-white/25">
                  Example: ₹800 logistics cost
                </p>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-7 flex flex-wrap gap-3">

              <button
                onClick={calculateProfit}
                disabled={loading}
                className="rounded-xl border border-[#7f9f5c]/40 bg-[#7f9f5c] px-6 py-3 text-sm font-semibold text-[#081007] shadow-[5px_5px_12px_rgba(0,0,0,.45),-2px_-2px_7px_rgba(255,255,255,.02)] transition-all duration-200 hover:bg-[#91ad68] hover:shadow-[7px_7px_16px_rgba(0,0,0,.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Calculating..."
                  : "Calculate Impact"}
              </button>

              <button
                onClick={useSampleValues}
                className="rounded-xl border border-[#3f6f3f] bg-[#132013] px-6 py-3 text-sm font-medium text-[#8fbd8f] shadow-[6px_6px_16px_rgba(0,0,0,.35)] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4] active:scale-[0.98]"
              >
                Use Sample Values
              </button>

            </div>

          </div>
        </section>

        {/* ======================================
            RESULTS
        ====================================== */}

        {result && (
          <section className="profit-section mb-8">

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              {/* TRADITIONAL */}

              <div className="profit-card rounded-2xl border border-white/[0.05] bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]">

                <p className="text-xs text-white/30">
                  Traditional Income
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  ₹
                  {Number(
                    result.traditional_income
                  ).toLocaleString("en-IN")}
                </h2>

                <p className="mt-2 text-[11px] text-white/25">
                  Traditional selling realization
                </p>

              </div>

              {/* KISANMITRA */}

              <div className="profit-card rounded-2xl border border-[#39ff14]/10 bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]">

                <p className="text-xs text-white/30">
                  KisanMitra Income
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#7f9f5c]">
                  ₹
                  {Number(
                    result.direct_income
                  ).toLocaleString("en-IN")}
                </h2>

                <p className="mt-2 text-[11px] text-white/25">
                  Direct farm-to-buyer realization
                </p>

              </div>

              {/* BENEFIT */}

              <div className="profit-card rounded-2xl border border-white/[0.05] bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]">

                <p className="text-xs text-white/30">
                  Farmer Benefit
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#7f9f5c]">
                  ₹
                  {Number(
                    result.benefit
                  ).toLocaleString("en-IN")}
                </h2>

                <p className="mt-2 text-[11px] text-white/25">
                  Additional realization
                </p>

              </div>

              {/* IMPROVEMENT */}

              <div className="profit-card rounded-2xl border border-white/[0.05] bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]">

                <p className="text-xs text-white/30">
                  Improvement
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#7f9f5c]">
                  {result.benefit_percentage}%
                </h2>

                <p className="mt-2 text-[11px] text-white/25">
                  Increase in realization
                </p>

              </div>

            </div>

          </section>
        )}

        {/* ======================================
            PROFIT CHART
        ====================================== */}

        <section className="profit-section">

          <div className="rounded-3xl border border-white/[0.05] bg-[#090c09] p-6 shadow-[10px_10px_25px_rgba(0,0,0,.45),-4px_-4px_12px_rgba(255,255,255,.015)]">

            {/* CHART HEADER */}

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-[#39ff14]/70">
                  PROFIT GROWTH
                </p>

                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  Farmer Profit Comparison
                </h2>

                <p className="mt-1 text-xs text-white/30">
                  Historical database performance with an optional
                  what-if scenario from the calculator.
                </p>

              </div>

              <span className="text-xs text-white/25">
                {loadingHistory ? "Loading..." : "Live Database Data"}
              </span>

            </div>

            {/* SVG CHART */}

            {loadingHistory ? (
              <div className="flex h-[350px] items-center justify-center text-sm text-[#8fbd8f]/60">
                Loading historical profit data...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-[350px] items-center justify-center text-sm text-[#8fbd8f]/60">
                No historical profit data available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <svg
                  ref={chartRef}
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full min-w-[700px]"
                >

                {/* GRID */}

                {gridValues.map(
                  (value) => (
                    <g key={value}>

                      <line
                        x1={paddingLeft}
                        x2={
                          chartWidth -
                          paddingRight
                        }
                        y1={getY(value)}
                        y2={getY(value)}
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4 6"
                      />

                      <text
                        x={paddingLeft - 15}
                        y={getY(value) + 5}
                        textAnchor="end"
                        fill="rgba(255,255,255,0.3)"
                        fontSize="12"
                      >
                        ₹{value}
                      </text>

                    </g>
                  )
                )}

                {/* X LABELS */}

                {chartData.map(
                  (item, index) => (
                    <text
                      key={`${item.period}-${index}`}
                      fontWeight={
                        item.period === "Scenario" ? "600" : "400"
                      }
                      x={getX(index)}
                      y={chartHeight - 15}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.3)"
                      fontSize="12"
                    >
                      {item.period}
                    </text>
                  )
                )}

                {/* TRADITIONAL */}

                <polyline
                  points={traditionalPoints}
                  fill="none"
                  stroke="#6f756f"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chart-line"
                />

                {/* KISANMITRA */}

                <polyline
                  points={kisanmitraPoints}
                  fill="none"
                  stroke="#7f9f5c"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="chart-line"
                />

                {/* TRADITIONAL DOTS */}

                {comparisonData.map(
                  (item, index) => (
                    <circle
                      key={`traditional-${index}`}
                      cx={getX(index)}
                      cy={getY(item.traditional)}
                      r="5"
                      fill="#6f756f"
                      className="data-dot"
                    />
                  )
                )}

                {/* KISANMITRA DOTS */}

                {comparisonData.map(
                  (item, index) => (
                    <circle
                      key={`kisan-${index}`}
                      cx={getX(index)}
                      cy={getY(item.kisanmitra)}
                      r="6"
                      fill="#7f9f5c"
                      className="data-dot"
                    />
                  )
                )}

                {scenario && (
                  <>
                    <circle
                      cx={getX(comparisonData.length)}
                      cy={getY(scenario.kisanmitra)}
                      r="9"
                      fill="#39ff14"
                      stroke="#050705"
                      strokeWidth="3"
                      className="data-dot"
                    />

                    <text
                      x={getX(comparisonData.length)}
                      y={getY(scenario.kisanmitra) - 15}
                      textAnchor="middle"
                      fill="#39ff14"
                      fontSize="12"
                      fontWeight="600"
                    >
                      ★ Scenario
                    </text>
                  </>
                )}

                </svg>
              </div>
            )}

            {/* LEGEND */}

            <div className="mt-5 flex justify-center gap-8 text-xs">

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-[#6f756f]" />

                <span className="text-white/40">
                  Traditional Farmer
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-[#7f9f5c]" />

                <span className="text-[#8fbd8f]">
                  KisanMitra
                </span>

              </div>

              {scenario && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#39ff14]">★</span>
                  <span className="text-[#39ff14]/70">
                    What-If Scenario
                  </span>
                </div>
              )}

            </div>

            <p className="mt-5 text-center text-[10px] text-white/20">
              Historical comparison generated automatically
              from KisanMitra order, product, and mandi price data.
            </p>

          </div>

        </section>

      </main>
    </div>
  );
}