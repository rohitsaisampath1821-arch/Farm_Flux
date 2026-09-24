import { API_BASE } from "../config";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  UserRound,
  MapPin,
  Leaf,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Farmer = {
  sid: number;
  name: string;
  phone?: string;
  farm_name?: string;
  location?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  farm_size?: number;
  farm_size_unit?: string;
  status?: string;
};

function Farmers() {
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFarmers, setSelectedFarmers] = useState<number[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  /* ================= LOADING COUNTER ================= */

  useEffect(() => {
    const counter = { val: 0 };

    gsap.to(counter, {
      val: 100,
      duration: 2.5,
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
      particlesRef.current.querySelectorAll(".farmers-particle");

    particles.forEach((particle) => {
      gsap.set(particle, {
        left: gsap.utils.random(1, 99) + "%",
        top: window.innerHeight + gsap.utils.random(0, 300),
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
        ".farmers-header",
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
        ".farmer-row",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          delay: 0.15,
          ease: "power2.out",
        }
      );

      const rows =
        contentRef.current?.querySelectorAll(".farmer-row") || [];

      rows.forEach((row) => {
        const element = row as HTMLElement;

        const enter = () => {
          gsap.to(element, {
            y: -2,
            backgroundColor: "rgba(57,255,20,0.025)",
            duration: 0.25,
            ease: "power2.out",
          });
        };

        const leave = () => {
          gsap.to(element, {
            y: 0,
            backgroundColor: "rgba(9,12,9,0)",
            duration: 0.25,
            ease: "power2.out",
          });
        };

        element.addEventListener("mouseenter", enter);
        element.addEventListener("mouseleave", leave);
      });
    }, contentRef);

    return () => ctx.revert();
  }, [loading, farmers, search]);

  /* ================= FETCH FARMERS ================= */

  async function fetchFarmers() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/farmers`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch farmers");
      }

      const data = await response.json();

      const farmerData = Array.isArray(data)
        ? data
        : Array.isArray(data.farmers)
          ? data.farmers
          : [];

      setFarmers(farmerData);
      setSelectedFarmers([]);
    } catch (err) {
      console.error("FARMER FETCH ERROR:", err);
      setError("Unable to load farmers from the server.");
    }
  }

  /* ================= SEARCH ================= */

  const filteredFarmers = farmers.filter((farmer) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      farmer.name,
      farmer.farm_name,
      farmer.location,
      farmer.village,
      farmer.district,
      farmer.state,
      farmer.phone,
      farmer.pincode,
      farmer.status,
      farmer.sid?.toString(),
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(query)
      );
  });

  /* ================= SELECT FARMER ================= */

  const toggleFarmer = (sid: number) => {
    setSelectedFarmers((prev) =>
      prev.includes(sid)
        ? prev.filter((id) => id !== sid)
        : [...prev, sid]
    );
  };

  /* ================= SELECT ALL ================= */

  const allFilteredSelected =
    filteredFarmers.length > 0 &&
    filteredFarmers.every((farmer) =>
      selectedFarmers.includes(farmer.sid)
    );

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedFarmers((prev) =>
        prev.filter(
          (id) =>
            !filteredFarmers.some(
              (farmer) => farmer.sid === id
            )
        )
      );
    } else {
      setSelectedFarmers((prev) => {
        const ids = new Set(prev);

        filteredFarmers.forEach((farmer) => {
          ids.add(farmer.sid);
        });

        return Array.from(ids);
      });
    }
  };

  /* ================= DELETE FARMERS ================= */

  async function deleteSelectedFarmers() {
    if (selectedFarmers.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedFarmers.length} selected farmer${
        selectedFarmers.length > 1 ? "s" : ""
      } permanently?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      for (const sid of selectedFarmers) {
        const response = await fetch(
          `${API_BASE}/api/farmers/${sid}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to delete farmer"
          );
        }
      }

      setSelectedFarmers([]);
      await fetchFarmers();
    } catch (err) {
      console.error("DELETE FARMER ERROR:", err);
      setError("Unable to delete selected farmer(s).");
    } finally {
      setDeleting(false);
    }
  }

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
        {Array.from({ length: 70 }).map((_, index) => (
          <span
            key={index}
            className="farmers-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      {/* ================= MAIN ================= */}

      <main
        ref={contentRef}
        className="relative z-10 mx-auto min-h-screen max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10"
      >
        {/* ================= HEADER ================= */}

        <div className="farmers-header mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              FARM MANAGEMENT
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Farmers
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/45">
              Farmers registered on the KisanMitra platform.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* DELETE */}

            {selectedFarmers.length > 0 && (
              <button
                onClick={deleteSelectedFarmers}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />
                {deleting
                  ? "Deleting..."
                  : `Delete (${selectedFarmers.length})`}
              </button>
            )}

            {/* REFRESH */}

            <button
              onClick={fetchFarmers}
              disabled={deleting}
              className="flex w-fit items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-3 text-sm font-medium text-[#8fbd8f] shadow-[6px_6px_16px_rgba(0,0,0,.35),-3px_-3px_10px_rgba(255,255,255,.015)] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={deleting ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        {!loading && !error && farmers.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-[430px]">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search farmers, farms, locations..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#090c09] pl-11 pr-4 text-sm text-white/75 outline-none shadow-[5px_5px_15px_rgba(0,0,0,.3)] transition-all placeholder:text-white/25 focus:border-[#3f6f3f] focus:ring-1 focus:ring-[#3f6f3f]"
              />
            </div>

            <p className="text-xs text-white/30">
              {filteredFarmers.length} of {farmers.length} farmers
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

        {!loading && farmers.length === 0 && !error && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09] px-6 text-center shadow-[10px_10px_25px_rgba(0,0,0,.45),-4px_-4px_12px_rgba(255,255,255,.015)]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d120d] text-[#39ff14]/70 shadow-[inset_4px_4px_10px_rgba(0,0,0,.5),inset_-3px_-3px_8px_rgba(255,255,255,.015)]">
              <UserRound size={28} />
            </div>

            <h2 className="text-xl font-semibold text-white">
              No farmers found
            </h2>

            <p className="mt-2 max-w-md text-sm text-white/40">
              Farmers registered on KisanMitra will appear here.
            </p>
          </div>
        )}

        {/* ================= NO SEARCH RESULTS ================= */}

        {!loading &&
          !error &&
          farmers.length > 0 &&
          filteredFarmers.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-[#090c09] text-center">
              <Search
                size={28}
                className="mb-4 text-[#39ff14]/50"
              />

              <h2 className="text-lg font-semibold text-white/80">
                No matching farmers
              </h2>

              <p className="mt-2 text-sm text-white/35">
                Try searching by name, farm, district or location.
              </p>
            </div>
          )}

        {/* ================= FARMER LIST ================= */}

        {!loading && filteredFarmers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#090c09] shadow-[8px_8px_22px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]">
            {/* ================= TABLE HEADER ================= */}

            <div className="overflow-x-auto">
              <div className="min-w-[1120px]">
                <div className="grid grid-cols-[55px_2.2fr_2fr_2.2fr_1.7fr_1.5fr_1.7fr_1.1fr_0.8fr] border-b border-white/[0.07] bg-[#0c100c]">
                  {/* SELECT ALL */}

                  <div className="flex items-center justify-center border-r border-white/[0.05] px-3 py-4">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 cursor-pointer accent-[#39ff14]"
                    />
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Farmer
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Farm
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Location
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    District / State
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Farm Size
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Phone
                  </div>

                  <div className="border-r border-white/[0.05] px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    Status
                  </div>

                  <div className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                    ID
                  </div>
                </div>

                {/* ================= ROWS ================= */}

                {filteredFarmers.map((farmer, index) => (
                  <div
                    key={farmer.sid}
                    className={`farmer-row grid grid-cols-[55px_2.2fr_2fr_2.2fr_1.7fr_1.5fr_1.7fr_1.1fr_0.8fr] border-b border-white/[0.05] ${
                      index === filteredFarmers.length - 1
                        ? "border-b-0"
                        : ""
                    } ${
                      selectedFarmers.includes(farmer.sid)
                        ? "bg-[#39ff14]/[0.025]"
                        : ""
                    }`}
                  >
                    {/* CHECKBOX */}

                    <div className="flex items-center justify-center border-r border-white/[0.05] px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedFarmers.includes(
                          farmer.sid
                        )}
                        onChange={() =>
                          toggleFarmer(farmer.sid)
                        }
                        className="h-4 w-4 cursor-pointer accent-[#39ff14]"
                      />
                    </div>

                    {/* FARMER */}

                    <div className="flex min-w-0 items-center gap-3 border-r border-white/[0.05] px-5 py-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d120d] text-[#39ff14]/75 shadow-[inset_3px_3px_7px_rgba(0,0,0,.5)]">
                        <UserRound size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/85">
                          {farmer.name}
                        </p>

                        <p className="mt-1 text-[11px] text-white/30">
                          Farmer #{farmer.sid}
                        </p>
                      </div>
                    </div>

                    {/* FARM */}

                    <div className="flex min-w-0 items-center border-r border-white/[0.05] px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/65">
                          {farmer.farm_name ||
                            "Not available"}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-white/25">
                          <Leaf size={12} />
                          Agricultural Farm
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
                            {farmer.village ||
                              farmer.location ||
                              "Not available"}
                          </p>

                          {farmer.pincode && (
                            <p className="mt-1 text-[11px] text-white/25">
                              PIN {farmer.pincode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* DISTRICT / STATE */}

                    <div className="flex min-w-0 items-center border-r border-white/[0.05] px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white/60">
                          {farmer.district ||
                            "Not available"}
                        </p>

                        <p className="mt-1 truncate text-[11px] text-white/30">
                          {farmer.state ||
                            "Not available"}
                        </p>
                      </div>
                    </div>

                    {/* FARM SIZE */}

                    <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                      <p className="text-sm text-white/60">
                        {farmer.farm_size
                          ? `${farmer.farm_size} ${
                              farmer.farm_size_unit ||
                              "acres"
                            }`
                          : "N/A"}
                      </p>
                    </div>

                    {/* PHONE */}

                    <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                      <p className="text-sm text-white/55">
                        {farmer.phone ||
                          "Not available"}
                      </p>
                    </div>

                    {/* STATUS */}

                    <div className="flex items-center border-r border-white/[0.05] px-5 py-4">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-medium capitalize ${
                          farmer.status === "active"
                            ? "bg-[#39ff14]/10 text-[#39ff14]/80"
                            : "bg-white/[0.05] text-white/40"
                        }`}
                      >
                        {farmer.status || "active"}
                      </span>
                    </div>

                    {/* ID */}

                    <div className="flex items-center px-5 py-4">
                      <span className="text-xs text-white/30">
                        #{farmer.sid}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= FOOTER ================= */}

            <div className="flex items-center justify-between border-t border-white/[0.06] bg-[#080b08] px-5 py-4">
              <p className="text-xs text-white/30">
                Showing{" "}
                <span className="text-white/55">
                  {filteredFarmers.length}
                </span>{" "}
                of{" "}
                <span className="text-white/55">
                  {farmers.length}
                </span>{" "}
                farmers
              </p>

              <p className="text-[11px] text-white/20">
                {selectedFarmers.length > 0
                  ? `${selectedFarmers.length} selected`
                  : "KisanMitra Farmer Registry"}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ================= LOADING SCREEN ================= */}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050705]">
          <div className="w-[min(90%,360px)] text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090c09] text-[#39ff14] shadow-[8px_8px_20px_rgba(0,0,0,.5),-4px_-4px_10px_rgba(255,255,255,.02)]">
                <UserRound size={28} />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#39ff14]/75">
              LOADING FARMERS
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

export default Farmers;