import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CircleHelp,
  Leaf,
  LogOut,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Buyer = {
  sid: number;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  location?: string;
  district?: string;
  state?: string;
  pincode?: string;
};

function BuyerDashboard() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const [buyer] = useState<Buyer | null>(() => {
    const data = localStorage.getItem("buyer");

    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".header", {
        y: -25,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".hero", {
        y: 35,
        opacity: 0,
        duration: 0.9,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.from(".card", {
        y: 35,
        opacity: 0,
        duration: 0.7,
        delay: 0.35,
        stagger: 0.1,
        ease: "power3.out",
      });

      gsap.from(".footer", {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 1,
        ease: "power2.out",
      });
    }, pageRef);

    const cards = gsap.utils.toArray<HTMLElement>(".card");

    cards.forEach((card) => {
      const enter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          duration: 0.3,
          ease: "power2.out",
        });
      };

      const leave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: "0 0 0 rgba(0,0,0,0)",
          duration: 0.35,
          ease: "power2.out",
        });
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);

      (card as any)._enter = enter;
      (card as any)._leave = leave;
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener(
          "mouseenter",
          (card as any)._enter
        );

        card.removeEventListener(
          "mouseleave",
          (card as any)._leave
        );
      });

      ctx.revert();
    };
  }, []);

  /* NEON PARTICLE BACKGROUND */
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles =
      gsap.utils.toArray<HTMLElement>(".particle");

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

  const logout = () => {
    localStorage.removeItem("buyer");
    localStorage.removeItem("buyerAuthenticated");
    localStorage.removeItem("buyerRememberMe");
    navigate("/login");
  };

  return (
    <div
      ref={pageRef}
      className="min-h-screen overflow-x-hidden bg-[#050705] text-white"
    >
      {/* PARTICLES */}
      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, i) => (
          <span
            key={i}
            className="particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1450px] px-5 sm:px-8 lg:px-12">
        {/* HEADER */}
        <header className="header flex items-center justify-between border-b border-white/[0.06] py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7f9f5c]/20 bg-[#101510]">
              <Leaf size={21} className="text-[#91ad68]" />
            </div>

            <div>
              <p className="text-lg font-semibold">
                Kisan
                <span className="text-[#91ad68]">
                  Mitra
                </span>
              </p>

              <p className="text-[9px] uppercase tracking-[0.22em] text-white/25">
                Buyer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              title="Search"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/40 transition hover:text-white/70 sm:flex"
            >
              <Search size={17} />
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 backdrop-blur-xl">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7f9f5c]/10">
                <UserRound
                  size={15}
                  className="text-[#91ad68]"
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white/75">
                  {buyer?.name || "Buyer"}
                </p>

                <p className="text-[9px] capitalize text-white/30">
                  {buyer?.business_type || "Buyer"}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/35 transition hover:border-red-400/20 hover:text-red-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="hero py-14 sm:py-20">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#7f9f5c]/20 bg-[#101510]/80 px-4 py-2 text-xs text-[#9db978] backdrop-blur-xl">
                <Leaf size={14} />
                Buyer Marketplace
              </div>

              <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Welcome back,{" "}
                <span className="text-[#91ad68]">
                  {buyer?.name || "Buyer"}.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
                Discover produce directly from farmers,
                understand market prices and make better
                sourcing decisions through KisanMitra.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/cart")}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-medium text-white/60 backdrop-blur-xl transition hover:bg-white/[0.04] hover:text-white/80"
              >
                <ShoppingCart size={16} />
                Cart
              </button>

              <button
                onClick={() => navigate("/products")}
                className="group flex items-center gap-2 rounded-xl border border-[#7f9f5c]/25 bg-[#7f9f5c] px-5 py-3 text-sm font-semibold text-[#0b1009] transition hover:bg-[#91ad68]"
              >
                Marketplace

                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>
          </div>
        </section>

        {/* ACCOUNT */}
        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={<Building2 size={18} />}
            label="Business"
            value={
              buyer?.business_name || "Not available"
            }
            sub={
              buyer?.business_type ||
              "Business account"
            }
          />

          <InfoCard
            icon={<MapPin size={18} />}
            label="Location"
            value={
              buyer?.district ||
              buyer?.location ||
              "Not available"
            }
            sub={
              buyer?.state ||
              "Location not available"
            }
          />

          <InfoCard
            icon={<Package size={18} />}
            label="Account"
            value="Verified Buyer"
            sub="KisanMitra marketplace access"
          />
        </section>

        {/* MARKETPLACE */}
        <section className="card mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-7 backdrop-blur-xl sm:p-9">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68]">
                  <Store size={19} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                    Marketplace
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white/70">
                    Direct farmer sourcing
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Source directly from{" "}
                <span className="text-[#91ad68]">
                  farmers.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/35">
                Find available produce, compare farmer
                prices and source directly without
                unnecessary intermediaries.
              </p>
            </div>

            <button
              onClick={() => navigate("/products")}
              className="group flex w-fit items-center gap-3 rounded-xl border border-[#7f9f5c]/25 bg-[#7f9f5c]/10 px-6 py-3.5 text-sm font-semibold text-[#a5bf82] transition hover:bg-[#7f9f5c]/15"
            >
              Browse Produce

              <ArrowUpRight
                size={17}
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </button>
          </div>
        </section>

        {/* DASHBOARD */}
        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <DashboardCard
            icon={<ShoppingBag size={18} />}
            mainIcon={<Store size={21} />}
            title="Fresh Produce"
            label="Marketplace"
            button="Browse marketplace"
            onClick={() => navigate("/products")}
          />

          <DashboardCard
            icon={<TrendingUp size={18} />}
            mainIcon={<TrendingUp size={21} />}
            title="Price Insights"
            label="Market Intelligence"
            button="View insights"
            onClick={() => navigate("/market-insights")}
          />
        </section>

        {/* HELP & SUPPORT */}
        <section className="card mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68]">
              <CircleHelp size={19} />
            </div>

            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                Support
              </p>

              <h2 className="mt-1 text-lg font-semibold text-white/80">
                Help & Support
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* KISAN BOT */}
            <button
              onClick={() => navigate("/kisan-bot")}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#0c100c] p-5 text-left transition-all duration-300 hover:border-[#7f9f5c]/30 hover:bg-[#101510]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68] transition-transform duration-300 group-hover:scale-105">
                <Bot size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/75">
                  KisanMitra Bot
                </p>

                <p className="mt-1 text-xs leading-5 text-white/25">
                  Ask questions and get assistance
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="ml-auto shrink-0 text-white/20 transition group-hover:text-[#91ad68]"
              />
            </button>

            {/* COMPLAINTS */}
            <button
              onClick={() => navigate("/complaints")}
              className="group flex items-center gap-4 rounded-xl border border-white/[0.07] bg-[#0c100c] p-5 text-left transition-all duration-300 hover:border-[#7f9f5c]/30 hover:bg-[#101510]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68] transition-transform duration-300 group-hover:scale-105">
                <CircleHelp size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/75">
                  General Complaints
                </p>

                <p className="mt-1 text-xs leading-5 text-white/25">
                  Report an issue to KisanMitra
                </p>
              </div>

              <ArrowUpRight
                size={16}
                className="ml-auto shrink-0 text-white/20 transition group-hover:text-[#91ad68]"
              />
            </button>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            icon={<Store size={18} />}
            title="Marketplace"
            description="Explore farmer listings"
            onClick={() => navigate("/products")}
          />

          <QuickAction
            icon={<ShoppingBag size={18} />}
            title="My Purchases"
            description="View your purchases"
            onClick={() => navigate("/my-purchases")}
          />

          <QuickAction
            icon={<TrendingUp size={18} />}
            title="Market Insights"
            description="Track market movement"
            onClick={() => navigate("/market-insights")}
          />
        </section>

        {/* FOOTER */}
        <footer className="footer mt-16 border-t border-white/[0.06] py-8">
          <div className="flex flex-col justify-between gap-4 text-xs text-white/25 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Leaf size={14} className="text-[#7f9f5c]" />
              © {new Date().getFullYear()} KisanMitra
            </div>

            <div className="flex gap-6">
              <span>Farm to Market</span>
              <span>Smart Agriculture</span>
              <span>Buyer Portal</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="card rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68]">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.17em] text-white/25">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-white/80">
            {value}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-white/25">
        {sub}
      </p>
    </div>
  );
}

function DashboardCard({
  icon,
  mainIcon,
  title,
  label,
  button,
  onClick,
}: {
  icon: React.ReactNode;
  mainIcon: React.ReactNode;
  title: string;
  label: string;
  button: string;
  onClick?: () => void;
}) {
  return (
    <div className="card rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.17em] text-white/25">
            {label}
          </p>

          <h3 className="mt-1 text-lg font-semibold text-white/85">
            {title}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68]">
          {icon}
        </div>
      </div>

      <div className="mt-6 flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-black/15 p-9 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/25">
          {mainIcon}
        </div>

        <button
          onClick={onClick}
          className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#91ad68] transition hover:text-[#a8c582]"
        >
          {button}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-left backdrop-blur-xl"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68] transition-transform duration-300 group-hover:scale-105">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-white/75">
          {title}
        </p>

        <p className="mt-1 text-xs text-white/25">
          {description}
        </p>
      </div>

      <ArrowUpRight
        size={15}
        className="ml-auto text-white/20 transition group-hover:text-[#91ad68]"
      />
    </button>
  );
}

export default BuyerDashboard;