import { API_BASE } from "../config";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Leaf,
  IndianRupee,
  CalendarDays,
  TrendingUp,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type MandiPrice = {
  id: number;
  price_date: string;
  state: string;
  district?: string;
  market: string;
  commodity: string;
  variety?: string;
  grade?: string;
  min_price?: number;
  max_price?: number;
  modal_price: number;
  arrival_quantity?: number;
  unit?: string;
  source?: string;
};

function MandiPrices() {
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  /* ================= FETCH ON LOAD ================= */

  useEffect(() => {
    fetchMandiPrices();
  }, []);

  /* ================= LOADING COUNTER ================= */

  useEffect(() => {
    const counter = { val: 0 };

    gsap.to(counter, {
      val: 100,
      duration: 2.2,
      ease: "power2.inOut",

      onUpdate: () => {
        setProgress(Math.round(counter.val));
      },

      onComplete: () => {
        setTimeout(() => {
          setLoading(false);
        }, 250);
      },
    });

    return () => {
      gsap.killTweensOf(counter);
    };
  }, []);

  /* ================= PARTICLES ================= */

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles =
      particlesRef.current.querySelectorAll(
        ".mandi-particle"
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

    return () => {
      gsap.killTweensOf(particles);
    };
  }, []);

  /* ================= PAGE ANIMATION ================= */

  useEffect(() => {
    if (loading || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".mandi-header",
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
        ".mandi-row",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          delay: 0.15,
          ease: "power2.out",
        }
      );

      const rows =
        contentRef.current?.querySelectorAll(
          ".mandi-row"
        ) || [];

      rows.forEach((row) => {
        const element = row as HTMLElement;

        const enter = () => {
          gsap.to(element, {
            y: -2,
            backgroundColor:
              "rgba(57,255,20,0.025)",
            duration: 0.25,
            ease: "power2.out",
          });
        };

        const leave = () => {
          gsap.to(element, {
            y: 0,
            backgroundColor:
              "rgba(9,12,9,0)",
            duration: 0.25,
            ease: "power2.out",
          });
        };

        element.addEventListener(
          "mouseenter",
          enter
        );

        element.addEventListener(
          "mouseleave",
          leave
        );
      });
    }, contentRef);

    return () => ctx.revert();
  }, [loading, prices, search]);

  /* ================= FETCH MANDI PRICES ================= */

  async function fetchMandiPrices() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/mandi-prices`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to fetch mandi prices"
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to fetch mandi prices"
        );
      }

      setPrices(
        Array.isArray(data.prices)
          ? data.prices
          : []
      );

      setSelectedPrices([]);
    } catch (err) {
      console.error(
        "MANDI PRICE FETCH ERROR:",
        err
      );

      setError(
        "Unable to load mandi prices from the server."
      );
    }
  }

  /* ================= SEARCH ================= */

  const filteredPrices = prices.filter((price) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      price.commodity,
      price.market,
      price.district,
      price.state,
      price.variety,
      price.grade,
      price.source,
      price.price_date,
      price.id?.toString(),
    ]
      .filter(Boolean)
      .some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      );
  });

  /* ================= SELECT PRICE ================= */

  const handleSelectPrice = (id: number) => {
    setSelectedPrices((prev) =>
      prev.includes(id)
        ? prev.filter(
            (priceId) => priceId !== id
          )
        : [...prev, id]
    );
  };

  /* ================= SELECT ALL ================= */

  const allFilteredSelected =
    filteredPrices.length > 0 &&
    filteredPrices.every((price) =>
      selectedPrices.includes(price.id)
    );

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedPrices((prev) =>
        prev.filter(
          (id) =>
            !filteredPrices.some(
              (price) => price.id === id
            )
        )
      );
    } else {
      setSelectedPrices((prev) => {
        const ids = new Set(prev);

        filteredPrices.forEach((price) => {
          ids.add(price.id);
        });

        return Array.from(ids);
      });
    }
  };

  /* ================= DELETE SELECTED ================= */

  const handleDeleteSelected = async () => {
    if (selectedPrices.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedPrices.length} selected mandi price record${
        selectedPrices.length > 1
          ? "s"
          : ""
      } permanently?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      for (const id of selectedPrices) {
        const response = await fetch(
          `${API_BASE}/api/mandi-prices/${id}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to delete mandi price"
          );
        }
      }

      setSelectedPrices([]);

      await fetchMandiPrices();
    } catch (err) {
      console.error(
        "DELETE MANDI PRICE ERROR:",
        err
      );

      setError(
        "Unable to delete selected mandi price records."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ================= FORMAT DATE ================= */

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050705] text-white"
    >
      {/* ================= PARTICLES ================= */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map(
          (_, index) => (
            <span
              key={index}
              className="mandi-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
              style={{
                boxShadow:
                  "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
              }}
            />
          )
        )}
      </div>

      {/* ================= MAIN ================= */}

      <main
        ref={contentRef}
        className="relative z-10 mx-auto min-h-screen max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10"
      >
        {/* ================= HEADER ================= */}

        <div className="mandi-header mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* BACK */}

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
            >
              <ArrowLeft size={17} />

              Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              MARKET INTELLIGENCE
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Mandi Prices
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/45">
              Latest mandi market prices from
              the KisanMitra platform.
            </p>
          </div>

          {/* ================= ACTION BUTTONS ================= */}

          <div className="flex flex-wrap gap-3">
            {/* DELETE */}

            {selectedPrices.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />

                {deleting
                  ? "Deleting..."
                  : `Delete (${selectedPrices.length})`}
              </button>
            )}

            {/* REFRESH */}

            <button
              onClick={fetchMandiPrices}
              disabled={deleting}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-3 text-sm font-medium text-[#8fbd8f] shadow-[6px_6px_16px_rgba(0,0,0,.35),-3px_-3px_10px_rgba(255,255,255,.015)] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  deleting
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        {!loading &&
          !error &&
          prices.length > 0 && (
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-[430px]">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search commodity, market, location..."
                  className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#090c09] pl-11 pr-4 text-sm text-white/75 outline-none shadow-[5px_5px_15px_rgba(0,0,0,.3)] transition-all placeholder:text-white/25 focus:border-[#3f6f3f] focus:ring-1 focus:ring-[#3f6f3f]"
                />
              </div>

              <p className="text-xs text-white/30">
                {filteredPrices.length} of{" "}
                {prices.length} records
              </p>
            </div>
          )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/10 bg-[#0a0b0a] px-5 py-4 text-sm text-red-300/80 shadow-[7px_7px_18px_rgba(0,0,0,.4)]">
            {error}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          prices.length === 0 &&
          !error && (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09] px-6 text-center shadow-[10px_10px_25px_rgba(0,0,0,.45),-4px_-4px_12px_rgba(255,255,255,.015)]">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d120d] text-[#39ff14]/70 shadow-[inset_4px_4px_10px_rgba(0,0,0,.5),inset_-3px_-3px_8px_rgba(255,255,255,.015)]">
                <IndianRupee size={28} />
              </div>

              <h2 className="text-xl font-semibold text-white">
                No mandi prices found
              </h2>

              <p className="mt-2 max-w-md text-sm text-white/40">
                Mandi price records will appear
                here when they are available.
              </p>
            </div>
          )}

        {/* ================= NO SEARCH RESULTS ================= */}

        {!loading &&
          !error &&
          prices.length > 0 &&
          filteredPrices.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-[#090c09] text-center">
              <Search
                size={28}
                className="mb-4 text-[#39ff14]/50"
              />

              <h2 className="text-lg font-semibold text-white/80">
                No matching mandi prices
              </h2>

              <p className="mt-2 text-sm text-white/35">
                Try searching by commodity,
                market, district or state.
              </p>
            </div>
          )}

        {/* ================= PRICE TABLE ================= */}

        {!loading &&
          filteredPrices.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#090c09] shadow-[8px_8px_22px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]">
              <div className="overflow-x-auto">
                <div className="min-w-[1300px]">

                  {/* ================= TABLE HEADER ================= */}

                  <div className="grid grid-cols-[55px_1.2fr_1.5fr_1.5fr_1.4fr_1.1fr_1.1fr_1.2fr_1.2fr_1.1fr] border-b border-white/[0.07] bg-[#0c100c]">

                    {/* SELECT ALL */}

                    <div className="flex items-center justify-center border-r border-white/[0.05] px-3 py-4">
                      <input
                        type="checkbox"
                        checked={
                          allFilteredSelected
                        }
                        onChange={
                          handleSelectAll
                        }
                        className="h-4 w-4 cursor-pointer accent-[#39ff14]"
                      />
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Commodity
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Market
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Location
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Variety / Grade
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Min Price
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Max Price
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Modal Price
                    </div>

                    <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Date
                    </div>

                    <div className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                      Arrival
                    </div>
                  </div>

                  {/* ================= ROWS ================= */}

                  {filteredPrices.map(
                    (price, index) => (
                      <div
                        key={price.id}
                        className={`mandi-row grid grid-cols-[55px_1.2fr_1.5fr_1.5fr_1.4fr_1.1fr_1.1fr_1.2fr_1.2fr_1.1fr] border-b border-white/[0.05] ${
                          index ===
                          filteredPrices.length - 1
                            ? "border-b-0"
                            : ""
                        } ${
                          selectedPrices.includes(
                            price.id
                          )
                            ? "bg-[#39ff14]/[0.025]"
                            : ""
                        }`}
                      >

                        {/* CHECKBOX */}

                        <div className="flex items-center justify-center border-r border-white/[0.05] px-3 py-4">
                          <input
                            type="checkbox"
                            checked={selectedPrices.includes(
                              price.id
                            )}
                            onChange={() =>
                              handleSelectPrice(
                                price.id
                              )
                            }
                            className="h-4 w-4 cursor-pointer accent-[#39ff14]"
                          />
                        </div>

                        {/* COMMODITY */}

                        <div className="flex min-w-0 items-center gap-3 border-r border-white/[0.05] px-5 py-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d120d] text-[#39ff14]/75 shadow-[inset_3px_3px_7px_rgba(0,0,0,.5)]">
                            <Leaf size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white/85">
                              {price.commodity}
                            </p>

                            <p className="mt-1 text-[11px] text-white/30">
                              Record #{price.id}
                            </p>
                          </div>
                        </div>

                        {/* MARKET */}

                        <div className="flex min-w-0 items-center border-r border-white/[0.05] px-5 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white/65">
                              {price.market ||
                                "Not available"}
                            </p>

                            <p className="mt-1 text-[11px] text-white/25">
                              Mandi Market
                            </p>
                          </div>
                        </div>

                        {/* LOCATION */}

                        <div className="flex min-w-0 items-center border-r border-white/[0.05] px-5 py-4">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-[#39ff14]/55"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-sm text-white/60">
                                {price.district ||
                                  "Not available"}
                              </p>

                              <p className="mt-1 truncate text-[11px] text-white/25">
                                {price.state ||
                                  "Not available"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* VARIETY / GRADE */}

                        <div className="flex min-w-0 items-center border-r border-white/[0.05] px-5 py-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm text-white/60">
                              {price.variety ||
                                "Not available"}
                            </p>

                            <p className="mt-1 truncate text-[11px] text-white/25">
                              {price.grade ||
                                "Standard grade"}
                            </p>
                          </div>
                        </div>

                        {/* MIN PRICE */}

                        <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                          <div>
                            <p className="text-sm text-white/60">
                              ₹
                              {price.min_price !=
                              null
                                ? price.min_price.toFixed(
                                    0
                                  )
                                : "N/A"}
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              /{" "}
                              {price.unit ||
                                "Quintal"}
                            </p>
                          </div>
                        </div>

                        {/* MAX PRICE */}

                        <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                          <div>
                            <p className="text-sm text-white/60">
                              ₹
                              {price.max_price !=
                              null
                                ? price.max_price.toFixed(
                                    0
                                  )
                                : "N/A"}
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              /{" "}
                              {price.unit ||
                                "Quintal"}
                            </p>
                          </div>
                        </div>

                        {/* MODAL PRICE */}

                        <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                          <div>
                            <p className="flex items-center gap-1 text-sm font-semibold text-[#9acb7c]">
                              <IndianRupee
                                size={13}
                              />

                              {price.modal_price.toFixed(
                                0
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              Modal /{" "}
                              {price.unit ||
                                "Quintal"}
                            </p>
                          </div>
                        </div>

                        {/* DATE */}

                        <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="shrink-0 text-[#39ff14]/50"
                            />

                            <span className="text-sm text-white/55">
                              {formatDate(
                                price.price_date
                              )}
                            </span>
                          </div>
                        </div>

                        {/* ARRIVAL */}

                        <div className="flex items-center px-5 py-4">
                          <div>
                            <p className="flex items-center gap-1 text-sm text-white/60">
                              <TrendingUp
                                size={13}
                                className="text-[#39ff14]/50"
                              />

                              {price.arrival_quantity !=
                              null
                                ? price.arrival_quantity.toFixed(
                                    1
                                  )
                                : "N/A"}
                            </p>

                            <p className="mt-1 text-[10px] text-white/25">
                              {price.unit ||
                                "Quintal"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* ================= FOOTER ================= */}

              <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#080b08] px-5 py-4">
                <p className="text-xs text-white/30">
                  Showing{" "}
                  <span className="text-white/55">
                    {filteredPrices.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-white/55">
                    {prices.length}
                  </span>{" "}
                  mandi price records
                </p>

                <p className="text-[11px] text-white/20">
                  {selectedPrices.length > 0
                    ? `${selectedPrices.length} selected`
                    : "KisanMitra Mandi Registry"}
                </p>
              </div>
            </div>
          )}

        {/* ================= FOOTER SPACE ================= */}

        <div className="h-10" />
      </main>

      {/* ================= LOADING SCREEN ================= */}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050705]">
          <div className="w-[min(90%,360px)] text-center">

            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090c09] text-[#39ff14] shadow-[8px_8px_20px_rgba(0,0,0,.5),-4px_-4px_10px_rgba(255,255,255,.02)]">
                <IndianRupee size={28} />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#39ff14]/75">
              LOADING MANDI PRICES
            </p>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#111511] shadow-[inset_3px_3px_7px_rgba(0,0,0,.5)]">
              <div
                className="h-full rounded-full bg-[#39ff14] transition-[width] duration-100"
                style={{
                  width: `${progress}%`,
                  boxShadow:
                    "0 0 10px rgba(57,255,20,.45)",
                }}
              />
            </div>

            <div className="mt-3 text-xs text-white/35">
              {progress}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MandiPrices;