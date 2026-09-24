import { API_BASE } from "../config";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Buyer = {
  sid: number;
  name: string;
  email?: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  district?: string;
  state?: string;
  pincode?: string;
  status?: string;
};

function Buyers() {
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBuyers();
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
      particlesRef.current.querySelectorAll(".buyers-particle");

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
        ".buyers-header",
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
        ".buyer-card",
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
          delay: 0.15,
          ease: "power2.out",
        }
      );

      const cards =
        contentRef.current?.querySelectorAll(".buyer-card") || [];

      cards.forEach((card) => {
        const element = card as HTMLElement;

        const enter = () => {
          gsap.to(element, {
            y: -8,
            scale: 1.02,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const leave = () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            boxShadow:
              "7px 7px 18px rgba(0,0,0,.45), -3px -3px 10px rgba(255,255,255,.015)",
            duration: 0.3,
            ease: "power2.out",
          });
        };

        element.addEventListener("mouseenter", enter);
        element.addEventListener("mouseleave", leave);
      });
    }, contentRef);

    return () => ctx.revert();
  }, [loading, buyers]);

  /* ================= FETCH BUYERS ================= */

  async function fetchBuyers() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/buyers`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch buyers");
      }

      const data = await response.json();

      const buyerData = Array.isArray(data)
        ? data
        : Array.isArray(data.buyers)
          ? data.buyers
          : [];

      setBuyers(buyerData);
    } catch (err) {
      console.error("BUYER FETCH ERROR:", err);
      setError("Unable to load buyers from the server.");
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
            className="buyers-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
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
        className="relative z-10 mx-auto min-h-screen max-w-[1450px] px-5 py-8 sm:px-8 lg:px-12"
      >
        {/* ================= HEADER ================= */}

        <div className="buyers-header mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              BUYER MANAGEMENT
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Buyers
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/45">
              Buyers registered on the KisanMitra platform.
            </p>
          </div>

          <button
            onClick={fetchBuyers}
            className="flex w-fit items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-3 text-sm font-medium text-[#8fbd8f] shadow-[6px_6px_16px_rgba(0,0,0,.35),-3px_-3px_10px_rgba(255,255,255,.015)] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/10 bg-[#0a0b0a] px-5 py-4 text-sm text-red-300/80 shadow-[7px_7px_18px_rgba(0,0,0,.4)]">
            {error}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading && buyers.length === 0 && !error && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09] px-6 text-center shadow-[10px_10px_25px_rgba(0,0,0,.45),-4px_-4px_12px_rgba(255,255,255,.015)]">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d120d] text-[#39ff14]/70 shadow-[inset_4px_4px_10px_rgba(0,0,0,.5),inset_-3px_-3px_8px_rgba(255,255,255,.015)]">
              <ShoppingCart size={28} />
            </div>

            <h2 className="text-xl font-semibold text-white">
              No buyers found
            </h2>

            <p className="mt-2 max-w-md text-sm text-white/40">
              Buyers registered on KisanMitra will appear here.
            </p>
          </div>
        )}

        {/* ================= BUYER GRID ================= */}

        {!loading && buyers.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {buyers.map((buyer) => (
              <article
                key={buyer.sid}
                className="buyer-card rounded-2xl border border-white/[0.05] bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.45),-3px_-3px_10px_rgba(255,255,255,.015)]"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0d130d] text-[#91ad68] shadow-[inset_3px_3px_8px_rgba(0,0,0,.4),inset_-2px_-2px_6px_rgba(255,255,255,.015)]">
                    <UserRound size={23} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-white">
                      {buyer.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-white/30">
                      Buyer ID #{buyer.sid}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-white/[0.05] bg-[#050705] p-3.5">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/20">
                    Business
                  </p>

                  <p className="mt-1 text-sm font-medium text-white/70">
                    {buyer.business_name || "Business not provided"}
                  </p>

                  {buyer.business_type && (
                    <p className="mt-1 text-xs capitalize text-white/30">
                      {buyer.business_type}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {buyer.location && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-[#91ad68]"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-white/25">
                          Location
                        </p>

                        <p className="mt-1 text-sm leading-5 text-white/55">
                          {buyer.location}
                        </p>

                        {(buyer.district || buyer.state) && (
                          <p className="mt-1 text-xs text-white/30">
                            {[buyer.district, buyer.state]
                              .filter(Boolean)
                              .join(", ")}
                            {buyer.pincode
                              ? ` - ${buyer.pincode}`
                              : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {buyer.phone && (
                    <div className="border-t border-white/[0.05] pt-3">
                      <div className="flex items-center gap-3">
                        <Phone
                          size={15}
                          className="shrink-0 text-[#91ad68]"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-white/25">
                            Contact
                          </p>

                          <p className="mt-1 text-sm text-white/55">
                            {buyer.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {buyer.email && (
                    <div className="border-t border-white/[0.05] pt-3">
                      <div className="flex items-center gap-3">
                        <Mail
                          size={15}
                          className="shrink-0 text-[#91ad68]"
                        />

                        <p className="truncate text-sm text-white/55">
                          {buyer.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.05] pt-4">
                  <span className="text-xs text-white/25">
                    Status
                  </span>

                  <span
                    className={
                      buyer.status === "active"
                        ? "rounded-full bg-[#7f9f5c]/10 px-2.5 py-1 text-[11px] font-medium text-[#91ad68]"
                        : "rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/45"
                    }
                  >
                    {buyer.status || "unknown"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ================= LOADING SCREEN ================= */}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050705]">
          <div className="w-[min(90%,360px)] text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#090c09] text-[#39ff14] shadow-[8px_8px_20px_rgba(0,0,0,.5),-4px_-4px_10px_rgba(255,255,255,.02)]">
                <ShoppingCart size={28} />
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-[#39ff14]/75">
              LOADING BUYERS
            </p>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#111511] shadow-[inset_3px_3px_7px_rgba(0,0,0,.5)]">
              <div
                className="h-full rounded-full bg-[#39ff14] transition-[width] duration-100"
                style={{
                  width: `${progress}%`,
                  boxShadow: "0 0 10px rgba(57,255,20,.45)",
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

export default Buyers;