import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  ChevronDown,
  Leaf,
  MapPin,
  IndianRupee,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

interface ForecastResponse {
  success: boolean;
  crop?: string;
  location?: string;
  previous_demand_kg?: number;
  predicted_demand_kg?: number;
  message?: string;
}

function Forecast() {
  const navigate = useNavigate();

  const particlesRef = useRef<HTMLDivElement>(null);
  const graphPathRef = useRef<SVGPathElement>(null);
  const graphDotRef = useRef<SVGCircleElement>(null);

  const [crop, setCrop] = useState("Tomato");
  const [location, setLocation] = useState("Guntur");
  const [modalPrice, setModalPrice] = useState("40");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] =
    useState<ForecastResponse | null>(null);

  const crops = [
    "Tomato",
    "Onion",
    "Potato",
    "Cucumber",
    "Cauliflower",
    "Apple",
  ];

  const locations = [
    "Guntur",
    "Kurnool",
    "Nellore",
    "Visakhapatnam",
    "Vijayawada",
  ];

  /* =========================================================
     BACKGROUND PARTICLES
  ========================================================= */

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles =
      gsap.utils.toArray<HTMLElement>(
        ".dashboard-particle"
      );

    particles.forEach((particle) => {
      gsap.set(particle, {
        left: gsap.utils.random(0, 100) + "%",
        top:
          window.innerHeight +
          gsap.utils.random(0, 250),
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

    return () => {
      gsap.killTweensOf(particles);
    };
  }, []);

  /* =========================================================
     DEMAND GRAPH ANIMATION
  ========================================================= */

  useEffect(() => {
    if (
      !result ||
      !graphPathRef.current ||
      !graphDotRef.current
    ) {
      return;
    }

    const previous = Number(
      result.previous_demand_kg ?? 0
    );

    const predicted = Number(
      result.predicted_demand_kg ?? 0
    );

    const maxValue = Math.max(
      previous,
      predicted,
      10
    );

    const minValue = 0;

    const chartLeft = 65;
    const chartRight = 475;
    const chartTop = 25;
    const chartBottom = 210;

    const x1 = chartLeft;
    const x2 = chartRight;

    const y1 =
      chartBottom -
      ((previous - minValue) /
        (maxValue - minValue)) *
        (chartBottom - chartTop);

    const y2 =
      chartBottom -
      ((predicted - minValue) /
        (maxValue - minValue)) *
        (chartBottom - chartTop);

    const middleX = (x1 + x2) / 2;

    const pathData = `
      M ${x1} ${y1}
      C ${middleX - 90} ${y1},
        ${middleX + 90} ${y2},
        ${x2} ${y2}
    `;

    const path = graphPathRef.current;
    const dot = graphDotRef.current;

    path.setAttribute("d", pathData);

    const pathLength = path.getTotalLength();

    /* Start line hidden */
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    /* Start dot at previous-demand point */
    gsap.set(dot, {
      opacity: 1,
      x: 0,
      y: 0,
    });

    const tl = gsap.timeline();

    /*
      Draw the demand line
    */
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.5,
      ease: "power2.inOut",
    });

    /*
      Move the point along the same SVG path
    */
    tl.to(
      dot,
      {
        motionPath: {
          path: path,
          align: path,
          alignOrigin: [0.5, 0.5],
          autoRotate: false,
        },
        duration: 2.5,
        ease: "power2.inOut",
      },
      0
    );

    return () => {
      tl.kill();
    };
  }, [result]);

  /* =========================================================
     FORECAST API
  ========================================================= */

  const handleForecast = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/forecast",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop,
            location,
            modal_price: Number(modalPrice),
          }),
        }
      );

      const data: ForecastResponse =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to generate forecast"
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const predictedDemand =
    result?.predicted_demand_kg;

  const previousDemand =
    result?.previous_demand_kg;

  /*
    Used only for the scale labels.
  */
  const graphMax = Math.max(
    Number(previousDemand ?? 0),
    Number(predictedDemand ?? 0),
    10
  );

  const graphStep = graphMax / 4;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020503] text-white">

      {/* =====================================================
          BACKGROUND GRID
      ===================================================== */}

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(126,166,92,0.15) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(126,166,92,0.15) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "70px 70px",
        }}
      />

      {/* =====================================================
          MOVING PARTICLES
      ===================================================== */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, i) => (
          <span
            key={i}
            className="dashboard-particle absolute h-[6px] w-[6px] rounded-full bg-[#49a52c]"
            style={{
              boxShadow:
                "0 0 6px rgba(73,165,44,.45), 0 0 12px rgba(73,165,44,.18)",
            }}
          />
        ))}
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-[1280px] px-8 py-8">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 flex items-center gap-2 text-[13px] text-[#777d78] transition-colors hover:text-[#9aaa91]"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-9 flex items-center justify-between">

          <div className="flex items-center gap-6">

            <div className="flex h-[86px] w-[86px] items-center justify-center rounded-[16px] border border-[#263c27] bg-[#071008]">

              <TrendingUp
                size={38}
                strokeWidth={1.7}
                className="text-[#86ad61]"
              />

            </div>

            <div>

              <div className="mb-2 text-[12px] tracking-[4px] text-[#5c8d46]">
                MARKET INTELLIGENCE
              </div>

              <h1 className="text-[36px] font-semibold leading-none tracking-[-1px]">
                Demand Forecast
              </h1>

              <p className="mt-3 text-[15px] text-[#6f756f]">
                Predict upcoming agricultural demand using
                historical market data.
              </p>

            </div>

          </div>

          {/* AI Badge */}

          <div className="flex items-center gap-4 rounded-[15px] border border-[#29422b] bg-[#071008] px-5 py-4">

            <BrainCircuit
              size={25}
              strokeWidth={1.7}
              className="text-[#82a95e]"
            />

            <div>

              <div className="text-[14px] font-medium text-[#d0d4cf]">
                AI Powered
              </div>

              <div className="mt-1 text-[12px] text-[#646b65]">
                Real-time prediction
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            MAIN CARDS
        =================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* =================================================
              PARAMETERS
          ================================================= */}

          <section className="min-h-[500px] rounded-[18px] border border-[#18241b] bg-[#050906] p-7">

            <div className="mb-8 flex items-start gap-3">

              <div className="h-[28px] w-[5px] rounded-full bg-[#81a95e]" />

              <div>

                <h2 className="text-[21px] font-semibold">
                  Forecast Parameters
                </h2>

                <p className="mt-2 text-[14px] text-[#6d746e]">
                  Configure the market conditions for prediction.
                </p>

              </div>

            </div>

            {/* Crop */}

            <div className="mb-6">

              <label className="mb-3 block text-[14px] text-[#a3a8a3]">
                Crop
              </label>

              <div className="relative">

                <div className="absolute bottom-0 left-0 top-0 flex w-[53px] items-center justify-center border-r border-[#151e17]">

                  <Leaf
                    size={19}
                    className="text-[#82a95e]"
                    strokeWidth={1.7}
                  />

                </div>

                <select
                  value={crop}
                  onChange={(e) =>
                    setCrop(e.target.value)
                  }
                  className="h-[52px] w-full appearance-none rounded-[10px] border border-[#1b281e] bg-[#060a07] pl-[68px] pr-12 text-[14px] text-[#d0d4cf] outline-none transition-colors focus:border-[#496a43]"
                >

                  {crops.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#050806]"
                    >
                      {item}
                    </option>
                  ))}

                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#687067]"
                />

              </div>

            </div>

            {/* Location */}

            <div className="mb-6">

              <label className="mb-3 block text-[14px] text-[#a3a8a3]">
                Market Location
              </label>

              <div className="relative">

                <div className="absolute bottom-0 left-0 top-0 flex w-[53px] items-center justify-center border-r border-[#151e17]">

                  <MapPin
                    size={19}
                    className="text-[#82a95e]"
                    strokeWidth={1.7}
                  />

                </div>

                <select
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  className="h-[52px] w-full appearance-none rounded-[10px] border border-[#1b281e] bg-[#060a07] pl-[68px] pr-12 text-[14px] text-[#d0d4cf] outline-none transition-colors focus:border-[#496a43]"
                >

                  {locations.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#050806]"
                    >
                      {item}
                    </option>
                  ))}

                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#687067]"
                />

              </div>

            </div>

            {/* Modal Price */}

            <div className="mb-7">

              <label className="mb-3 block text-[14px] text-[#a3a8a3]">
                Current Modal Price (₹ / kg)
              </label>

              <div className="relative">

                <div className="absolute bottom-0 left-0 top-0 flex w-[53px] items-center justify-center border-r border-[#151e17]">

                  <IndianRupee
                    size={18}
                    className="text-[#82a95e]"
                    strokeWidth={1.7}
                  />

                </div>

                <input
                  type="number"
                  min="0"
                  value={modalPrice}
                  onChange={(e) =>
                    setModalPrice(e.target.value)
                  }
                  className="h-[52px] w-full rounded-[10px] border border-[#1b281e] bg-[#060a07] pl-[68px] pr-4 text-[14px] text-[#d0d4cf] outline-none transition-colors focus:border-[#496a43]"
                />

              </div>

            </div>

            {/* Button */}

            <button
              onClick={handleForecast}
              disabled={loading}
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#557b48] bg-[#162316] text-[15px] font-medium text-[#d5dccf] transition-all hover:bg-[#1b2b1b] disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin text-[#82a95e]"
                  />

                  Generating Forecast...
                </>
              ) : (
                <>
                  <ArrowUpRight
                    size={20}
                    className="text-[#82a95e]"
                  />

                  Forecast Demand
                </>
              )}

            </button>

            {error && (
              <div className="mt-4 rounded-[9px] border border-[#422727] bg-[#120807] px-4 py-3 text-[13px] text-[#a87979]">
                {error}
              </div>
            )}

          </section>

          {/* =================================================
              RESULT + GRAPH
          ================================================= */}

          <section className="min-h-[500px] rounded-[18px] border border-[#18241b] bg-[#050906] p-7">

            <div className="flex items-start gap-3">

              <div className="h-[28px] w-[5px] rounded-full bg-[#81a95e]" />

              <div>

                <h2 className="text-[21px] font-semibold">
                  Forecast Result
                </h2>

                <p className="mt-2 text-[14px] text-[#6d746e]">
                  AI-generated demand estimate based on
                  historical data.
                </p>

              </div>

            </div>

            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!result && !loading && (
              <div className="flex h-[385px] flex-col items-center justify-center text-center">

                <div className="mb-7 flex h-[102px] w-[102px] items-center justify-center rounded-full border border-[#29412a] bg-[#091109]">

                  <BarChart3
                    size={43}
                    strokeWidth={1.5}
                    className="text-[#82a95e]"
                  />

                </div>

                <h3 className="text-[19px] font-semibold text-[#d7dbd5]">
                  Ready for prediction
                </h3>

                <p className="mt-3 max-w-[330px] text-[14px] leading-6 text-[#666d67]">
                  Select your crop, location and modal price
                  then generate a forecast.
                </p>

              </div>
            )}

            {/* =================================================
                LOADING STATE
            ================================================= */}

            {loading && (
              <div className="flex h-[385px] flex-col items-center justify-center text-center">

                <Loader2
                  size={36}
                  className="mb-5 animate-spin text-[#82a95e]"
                />

                <h3 className="text-[18px] font-semibold text-[#d7dbd5]">
                  Analyzing historical demand...
                </h3>

                <p className="mt-3 text-[13px] text-[#666d67]">
                  Running prediction model
                </p>

              </div>
            )}

            {/* =================================================
                RESULT STATE
            ================================================= */}

            {result && !loading && (
              <div>

                {/* =================================================
                    GRAPH
                ================================================= */}

                <div className="mt-6 rounded-[12px] border border-[#18241b] bg-[#030604] p-4">

                  <div className="mb-3 flex items-center justify-between">

                    <div>

                      <div className="text-[11px] tracking-[2px] text-[#638b50]">
                        DEMAND TREND
                      </div>

                      <div className="mt-1 text-[15px] font-medium text-[#cbd0ca]">
                        Previous vs Predicted
                      </div>

                    </div>

                    <div className="text-right">

                      <div className="text-[11px] text-[#5e685f]">
                        PREDICTED
                      </div>

                      <div className="mt-1 text-[16px] font-medium text-[#91b66b]">
                        {predictedDemand?.toFixed(1)} kg
                      </div>

                    </div>

                  </div>

                  <svg
                    viewBox="0 0 520 250"
                    className="h-[270px] w-full overflow-visible"
                  >

                    {/* ================= AXES ================= */}

                    <line
                      x1="65"
                      y1="25"
                      x2="65"
                      y2="210"
                      stroke="#243127"
                      strokeWidth="1"
                    />

                    <line
                      x1="65"
                      y1="210"
                      x2="475"
                      y2="210"
                      stroke="#243127"
                      strokeWidth="1"
                    />

                    {/* ================= GRID ================= */}

                    {[0, 1, 2, 3, 4].map((index) => {
                      const y =
                        210 -
                        index *
                          (185 / 4);

                      const value =
                        graphStep * index;

                      return (
                        <g key={index}>

                          <line
                            x1="65"
                            y1={y}
                            x2="475"
                            y2={y}
                            stroke="#18241b"
                            strokeWidth="1"
                          />

                          <text
                            x="17"
                            y={y + 4}
                            fill="#59635b"
                            fontSize="11"
                          >
                            {value.toFixed(0)}
                          </text>

                        </g>
                      );
                    })}

                    {/* ================= DEMAND PATH ================= */}

                    <path
                      ref={graphPathRef}
                      d="M 65 210"
                      fill="none"
                      stroke="#82a95e"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* ================= MOVING POINT ================= */}

                    <circle
                      ref={graphDotRef}
                      cx="65"
                      cy="210"
                      r="6"
                      fill="#82a95e"
                    />

                    {/* ================= POINT LABELS ================= */}

                    <text
                      x="65"
                      y="235"
                      textAnchor="middle"
                      fill="#59635b"
                      fontSize="11"
                    >
                      Previous
                    </text>

                    <text
                      x="475"
                      y="235"
                      textAnchor="middle"
                      fill="#73895f"
                      fontSize="11"
                    >
                      Predicted
                    </text>

                  </svg>

                </div>

                {/* =================================================
                    RESULT METRICS
                ================================================= */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-[#18241b] bg-[#050906] p-4">

                    <p className="text-[12px] text-[#626961]">
                      CROP
                    </p>

                    <p className="mt-1 text-[16px] font-medium text-[#cbd0ca]">
                      {result.crop}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#18241b] bg-[#050906] p-4">

                    <p className="text-[12px] text-[#626961]">
                      LOCATION
                    </p>

                    <p className="mt-1 text-[16px] font-medium text-[#cbd0ca]">
                      {result.location}
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#18241b] bg-[#050906] p-4">

                    <p className="text-[12px] text-[#626961]">
                      PREVIOUS DEMAND
                    </p>

                    <p className="mt-1 text-[16px] font-medium text-[#cbd0ca]">
                      {previousDemand?.toFixed(1)} kg
                    </p>

                  </div>

                  <div className="rounded-xl border border-[#18241b] bg-[#050906] p-4">

                    <p className="text-[12px] text-[#626961]">
                      MODAL PRICE
                    </p>

                    <p className="mt-1 text-[16px] font-medium text-[#cbd0ca]">
                      ₹{modalPrice} / kg
                    </p>

                  </div>

                </div>

                {/* =================================================
                    INSIGHT
                ================================================= */}

                <div className="mt-4 rounded-xl border border-[#344b37] bg-[#0d150e] p-4">

                  <p className="text-[13px] leading-6 text-[#7d887f]">

                    Based on historical demand for{" "}

                    <span className="font-medium text-[#9aac9c]">
                      {result.crop}
                    </span>{" "}

                    in{" "}

                    <span className="font-medium text-[#9aac9c]">
                      {result.location}
                    </span>
                    , the model estimates demand of{" "}

                    <span className="font-medium text-[#cbd2cc]">
                      {result.predicted_demand_kg} kg
                    </span>
                    .

                  </p>

                </div>

              </div>
            )}

          </section>

        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Crop */}

          <div className="flex h-[105px] items-center gap-4 rounded-[15px] border border-[#18241b] bg-[#050906] px-5">

            <div className="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] border border-[#1d2d20] bg-[#081008]">

              <Leaf
                size={22}
                strokeWidth={1.7}
                className="text-[#82a95e]"
              />

            </div>

            <div>

              <div className="mb-2 text-[12px] text-[#626961]">
                Crop
              </div>

              <div className="text-[16px] font-medium text-[#cbd0ca]">
                {result?.crop || "—"}
              </div>

            </div>

          </div>

          {/* Location */}

          <div className="flex h-[105px] items-center gap-4 rounded-[15px] border border-[#18241b] bg-[#050906] px-5">

            <div className="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] border border-[#1d2d20] bg-[#081008]">

              <MapPin
                size={22}
                strokeWidth={1.7}
                className="text-[#82a95e]"
              />

            </div>

            <div>

              <div className="mb-2 text-[12px] text-[#626961]">
                Location
              </div>

              <div className="text-[16px] font-medium text-[#cbd0ca]">
                {result?.location || "—"}
              </div>

            </div>

          </div>

          {/* Previous Demand */}

          <div className="flex h-[105px] items-center gap-4 rounded-[15px] border border-[#18241b] bg-[#050906] px-5">

            <div className="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] border border-[#1d2d20] bg-[#081008]">

              <BarChart3
                size={22}
                strokeWidth={1.7}
                className="text-[#82a95e]"
              />

            </div>

            <div>

              <div className="mb-2 text-[12px] text-[#626961]">
                Previous Demand
              </div>

              <div className="text-[16px] font-medium text-[#cbd0ca]">
                {previousDemand !== undefined
                  ? `${previousDemand.toFixed(0)} kg`
                  : "—"}
              </div>

            </div>

          </div>

          {/* Predicted Demand */}

          <div className="flex h-[105px] items-center gap-4 rounded-[15px] border border-[#18241b] bg-[#050906] px-5">

            <div className="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] border border-[#1d2d20] bg-[#081008]">

              <TrendingUp
                size={22}
                strokeWidth={1.7}
                className="text-[#82a95e]"
              />

            </div>

            <div>

              <div className="mb-2 text-[12px] text-[#626961]">
                Predicted Demand
              </div>

              <div className="text-[16px] font-medium text-[#cbd0ca]">
                {predictedDemand !== undefined
                  ? `${predictedDemand.toFixed(0)} kg`
                  : "—"}
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            MARKET SIGNALS
        ===================================================== */}

        <div className="mt-14 flex items-end justify-between">

          <div className="rounded-[12px] border border-[#18241b] bg-[#050906] px-5 py-4">

            <div className="mb-4 text-[13px] font-medium text-[#b7bdb7]">
              Market Signals
            </div>

            <div className="space-y-3">

              <div className="flex items-center gap-3">

                <span className="h-[9px] w-[9px] rounded-full bg-[#82b65f]" />

                <span className="text-[12px] text-[#737a73]">
                  Supply
                </span>

              </div>

              <div className="flex items-center gap-3">

                <span className="h-[9px] w-[9px] rounded-full bg-[#d76666]" />

                <span className="text-[12px] text-[#737a73]">
                  High Demand
                </span>

              </div>

              <div className="flex items-center gap-3">

                <span className="h-[9px] w-[9px] rounded-full bg-[#d5bd55]" />

                <span className="text-[12px] text-[#737a73]">
                  Mandi Price
                </span>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-4 rounded-[12px] border border-[#18241b] bg-[#050906] px-5 py-4">

            <span className="h-[10px] w-[10px] rounded-full bg-[#d76666]" />

            <div>

              <div className="text-[14px] font-medium text-[#c4c9c3]">
                High Demand
              </div>

              <div className="mt-1 text-[12px] text-[#666d67]">
                {location}
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-16 pb-4 text-center text-[12px] text-[#4f554f]">
          KisanMitra&nbsp; • &nbsp;Smart Agricultural Intelligence
        </div>

      </main>
    </div>
  );
}

export default Forecast;