import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Handshake,
  Leaf,
  MapPin,
  Play,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Flip } from "gsap/Flip";
import gsap from "gsap";

const VIDEO_URL =
  "https://farm-flux.s3.eu-north-1.amazonaws.com/b9984103e8.mp4";

function GetStarted() {
  const [loaded, setLoaded] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  const handleExplore = () => {
    if (!featuresRef.current) return;

    const items = featuresRef.current.querySelector(".items");
    if (!items) return;

    const state = Flip.getState(items.children);

    featuresRef.current.classList.toggle("active");
    setFeaturesOpen((prev) => !prev);

    Flip.from(state, {
      duration: 0.55,
      ease: "power2.inOut",
      stagger: 0.04,
      absolute: true,
      nested: true,
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050705] text-white">

      {/* NAVBAR */}
      <header
        className={`relative z-50 px-5 pt-5 sm:px-8 lg:px-12 transition-all duration-1000 ${
          loaded
            ? "translate-y-0 opacity-100"
            : "-translate-y-8 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-[1450px] items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0b0e0b]/90 px-5 py-3 backdrop-blur-xl sm:px-7">

          <button
            onClick={() => (window.location.href = "/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#7f9f5c]/20 bg-[#111711] transition-all duration-500 group-hover:border-[#8cae62]/35">
              <Leaf
                size={24}
                className="text-[#91ad68] transition-transform duration-500 group-hover:rotate-6"
              />
            </div>

            <div className="text-left">
              <h1 className="text-xl font-bold tracking-tight">
                Kisan<span className="text-[#91ad68]">Mitra</span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                Smart Farming
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-8 lg:flex">
            <a
              href="#home"
              className="relative text-sm font-medium text-[#9ab875]"
            >
              Home
              <span className="absolute -bottom-2 left-0 h-px w-full bg-[#819f5c]" />
            </a>

            {["about", "features", "marketplace", "contact"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-sm capitalize text-white/45 transition hover:text-white/75"
              >
                {item}
              </a>
            ))}
          </div>

          <button
            onClick={handleGetStarted}
            className="group flex items-center gap-3 rounded-full border border-[#819f5c]/25 bg-[#182016] px-5 py-2.5 text-sm font-semibold text-[#a5bf82] transition-all duration-300 hover:border-[#91ad68]/40 hover:bg-[#1c2619] active:scale-95"
          >
            Get Started

            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#8cae62] text-[#101410] transition-transform duration-300 group-hover:translate-x-1">
              <ArrowRight size={15} />
            </span>
          </button>
        </nav>
      </header>

      {/* HERO */}
      <main id="home" className="relative z-10">

        <section className="mx-auto grid max-w-[1450px] items-center gap-12 px-5 pb-16 pt-16 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:px-12 lg:pb-24 lg:pt-24">

          {/* LEFT */}
          <div
            className={`max-w-2xl transition-all duration-[1200ms] ${
              loaded
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 translate-y-6 opacity-0"
            }`}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#7f9f5c]/20 bg-[#101610] px-4 py-2 text-sm text-[#9db978]">
              <Leaf size={15} />
              <span>Empowering Farmers • Enriching Lives</span>
            </div>

            <h2 className="text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">

              <span
                className={`inline-block transition-all duration-1000 ${
                  loaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                Your Smart Partner
              </span>

              <br />

              <span
                className={`inline-block transition-all delay-200 duration-1000 ${
                  loaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                for{" "}

                <span className="relative inline-block text-[#91ad68]">
                  Better Farming

                  <span
                    className={`absolute -bottom-2 left-0 h-[2px] w-full origin-left bg-[#728f50] transition-transform duration-1000 ${
                      loaded ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </span>
              </span>
            </h2>

            <p
              className={`mt-8 max-w-xl text-base leading-8 text-white/45 transition-all delay-500 duration-1000 sm:text-lg ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              KisanMitra connects farmers directly with markets, buyers and
              smarter agricultural insights — helping you make better
              decisions and earn better value from your produce.
            </p>

            <div
              className={`mt-9 flex flex-wrap items-center gap-4 transition-all delay-700 duration-1000 ${
                loaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0"
              }`}
            >
              <button
                onClick={handleGetStarted}
                className="group flex items-center gap-3 rounded-full border border-[#819f5c]/20 bg-[#7f9f5c] px-6 py-3.5 font-semibold text-[#0b1009] transition-all duration-300 hover:bg-[#91ad68] active:scale-95"
              >
                Get Started

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c110b] text-[#a5bf82] transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={18} />
                </span>
              </button>

              <button
                onClick={handleExplore}
                className="group flex items-center gap-3 rounded-full border border-white/[0.10] bg-white/[0.025] px-6 py-3.5 font-medium text-white/65 backdrop-blur-md transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.045] hover:text-white/85 active:scale-95"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.12] text-white/60 transition-transform duration-300 group-hover:scale-105">
                  <Play size={14} fill="currentColor" className="ml-0.5" />
                </span>

                {featuresOpen ? "Close Overview" : "Explore KisanMitra"}
              </button>
            </div>
          </div>

          {/* VIDEO */}
          <div
            className={`relative transition-all delay-200 duration-[1400ms] ${
              loaded
                ? "translate-x-0 scale-100 opacity-100"
                : "translate-x-12 translate-y-6 scale-[.96] opacity-0"
            }`}
          >
            <div className="group relative aspect-[4/4.5] overflow-hidden rounded-[32px] border border-white/[0.10] bg-[#080b08] shadow-2xl shadow-black/50 transition-all duration-700 hover:-translate-y-1 hover:border-white/[0.15]">

              <video
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1800ms] group-hover:scale-[1.02]"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
              >
                <source src={VIDEO_URL} type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-gradient-to-t from-[#050705]/85 via-transparent to-[#050705]/10" />

              <div className="absolute left-5 top-5 rounded-full border border-white/[0.12] bg-[#080b08]/65 px-4 py-2 text-xs font-medium text-white/65 backdrop-blur-xl">
                Farm to Market
              </div>

              <FloatingCard
                right
                title="Market Intelligence"
                text="Smarter Decisions"
                icon={<BarChart3 size={19} />}
              />

              <FloatingCard
                title="Market Discovery"
                text="Find Better Markets"
                icon={<MapPin size={19} />}
              />

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">
                    KisanMitra
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white/90">
                    Technology for every farmer
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.12] bg-black/30 text-[#9ab875] backdrop-blur-md">
                  <Leaf size={19} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          ref={featuresRef}
          id="features"
          className="relative mx-auto max-w-[1370px] px-5 sm:px-8 lg:px-12"
        >
          <div className="items grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <Feature
              icon={<Handshake size={21} />}
              title="Direct Buyers"
              description="Connect with buyers directly"
              delay={100}
            />

            <Feature
              icon={<BarChart3 size={21} />}
              title="Market Insights"
              description="Make informed selling decisions"
              delay={200}
            />

            <Feature
              icon={<Truck size={21} />}
              title="Smart Logistics"
              description="Optimize your delivery routes"
              delay={300}
            />

            <Feature
              icon={<ShoppingCart size={21} />}
              title="Better Markets"
              description="Discover profitable opportunities"
              delay={400}
            />

          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="relative mt-24 border-y border-white/[0.06] bg-[#070a07] px-5 py-24 sm:px-8 lg:mt-28 lg:px-12"
        >
          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8da968]">
              <Leaf size={15} />
              About KisanMitra
            </div>

            <h3 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Building a{" "}
              <span className="text-[#91ad68]">Stronger Future</span>{" "}
              for Farmers
            </h3>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-white/38 sm:text-base">
              A digital platform designed to reduce unnecessary intermediaries
              and help farmers discover better markets, connect with buyers
              and make smarter decisions.
            </p>

            <div className="mx-auto mt-10 h-px max-w-2xl bg-white/[0.06]" />

            <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-white/25">
              From farm to market, KisanMitra brings technology closer to the
              people who grow our food.
            </p>

          </div>
        </section>

        {/* FOOTER */}
        <footer
          id="contact"
          className="border-t border-white/[0.06] bg-[#050705] px-5 py-10 sm:px-8 lg:px-12"
        >
          <div className="mx-auto flex max-w-[1370px] flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#7f9f5c]/20 bg-[#0d120d]">
                <Leaf size={17} className="text-[#8fae69]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-white/80">
                  KisanMitra
                </p>

                <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                  Smart Agriculture
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-white/30">
              <a href="#home" className="transition hover:text-white/60">
                Home
              </a>

              <a href="#about" className="transition hover:text-white/60">
                About
              </a>

              <a href="#features" className="transition hover:text-white/60">
                Features
              </a>

              <a href="#contact" className="transition hover:text-white/60">
                Contact
              </a>
            </div>

            <p className="text-xs text-white/20">
              © {new Date().getFullYear()} KisanMitra
            </p>

          </div>
        </footer>
      </main>

      <style>{`
        @keyframes floatOne {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes floatTwo {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(7px);
          }
        }

        @keyframes featureIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function FloatingCard({
  right = false,
  title,
  text,
  icon,
}: {
  right?: boolean;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`absolute ${
        right
          ? "right-4 top-20 sm:right-6"
          : "bottom-28 left-4 sm:left-6"
      } w-[205px] rounded-2xl border border-white/[0.11] bg-[#0b0f0b]/80 p-4 shadow-xl shadow-black/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7f9f5c]/20 sm:w-[230px]`}
      style={{
        animation: `${right ? "floatOne" : "floatTwo"} ${
          right ? 6 : 7
        }s ease-in-out infinite`,
      }}
    >
      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f9f5c]/20 bg-[#121811] text-[#91ad68]">
          {icon}
        </div>

        <div>
          <p className="text-xs text-white/35">
            {title}
          </p>

          <p className="text-sm font-semibold text-white/80">
            {text}
          </p>
        </div>

      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className="group flex min-h-[130px] items-center gap-4 rounded-2xl border border-white/[0.07] bg-[#080b08] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#7f9f5c]/20 hover:bg-[#0c110c]"
      style={{
        animation: `featureIn 800ms cubic-bezier(.22,1,.36,1) ${delay}ms both`,
      }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#7f9f5c]/20 bg-[#111711] text-[#91ad68] transition-transform duration-500 group-hover:scale-105">
        {icon}
      </div>

      <div>
        <p className="font-semibold text-white/80 transition-colors duration-300 group-hover:text-[#a5bf82]">
          {title}
        </p>

        <p className="mt-1 text-xs text-white/30">
          {description}
        </p>
      </div>
    </div>
  );
}

export default GetStarted;