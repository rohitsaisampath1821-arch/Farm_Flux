import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  Leaf,
  Map,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  UserRound,
  TrendingUp,
  Navigation,
} from "lucide-react";
import gsap from "gsap";

function Dashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState("Dashboard");
  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const [admin] = useState<{
    sid: number;
    name: string;
    email: string;
  } | null>(() => {
    const storedAdmin = localStorage.getItem("admin");
    if (!storedAdmin) return null;

    try {
      return JSON.parse(storedAdmin);
    } catch (error) {
      console.error("Unable to load admin information:", error);
      return null;
    }
  });

  const menuGroups = [
    {
      label: "MAIN",
      items: [{ name: "Dashboard", icon: <LayoutDashboard size={18} /> }],
    },
    {
      label: "FARM MANAGEMENT",
      items: [
        { name: "Products", icon: <Package size={18} /> },
        { name: "Farmers", icon: <Users size={18} /> },
        { name: "Buyers", icon: <ShoppingCart size={18} /> },
      ],
    },
    {
      label: "OPERATIONS",
      items: [
        { name: "Orders", icon: <BarChart3 size={18} /> },
        { name: "Logistics", icon: <Truck size={18} /> },
      ],
    },
    {
      label: "INTELLIGENCE",
      items: [
        { name: "Market Insights", icon: <TrendingUp size={18} /> },
        { name: "Forecast", icon: <BarChart3 size={18} /> },
        { name: "Mandi Prices", icon: <Map size={18} /> },
      ],
    },
  ];

  /* ================= GSAP PAGE ANIMATION ================= */

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".dashboard-sidebar", {
        x: -35,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".dashboard-topbar", {
        y: -25,
        opacity: 0,
        duration: 0.8,
        delay: 0.1,
        ease: "power3.out",
      });

      gsap.from(".section-heading", {
        y: 25,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      gsap.from(".market-map", {
        y: 35,
        opacity: 0,
        scale: 0.985,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".market-action", {
        y: 25,
        opacity: 0,
        duration: 0.7,
        delay: 0.55,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.from(".map-info-card", {
        y: 15,
        opacity: 0,
        duration: 0.7,
        delay: 0.7,
        stagger: 0.12,
        ease: "power2.out",
      });

      gsap.from(".map-legend", {
        y: 15,
        opacity: 0,
        duration: 0.7,
        delay: 0.8,
        ease: "power2.out",
      });

      gsap.to(".map-marker", {
        scale: 1.08,
        opacity: 0.78,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        stagger: 0.25,
        ease: "sine.inOut",
      });
    }, pageRef);

    const cards = gsap.utils.toArray<HTMLElement>(
      ".map-info-card, .market-action"
    );

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

      (
        card as HTMLElement & {
          _enter?: () => void;
          _leave?: () => void;
        }
      )._enter = enter;

      (
        card as HTMLElement & {
          _enter?: () => void;
          _leave?: () => void;
        }
      )._leave = leave;
    });

    return () => {
      cards.forEach((card) => {
        const item = card as HTMLElement & {
          _enter?: () => void;
          _leave?: () => void;
        };

        if (item._enter) {
          card.removeEventListener("mouseenter", item._enter);
        }

        if (item._leave) {
          card.removeEventListener("mouseleave", item._leave);
        }
      });

      ctx.revert();
    };
  }, []);

  /* ================= PARTICLE BACKGROUND ================= */

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = gsap.utils.toArray<HTMLElement>(".dashboard-particle");

    particles.forEach((particle) => {
      gsap.set(particle, {
        left: gsap.utils.random(0, 100) + "%",
        top: window.innerHeight + gsap.utils.random(0, 250),
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

  return (
    <div ref={pageRef} className="dashboard relative overflow-hidden">
      {/* ================= BACKGROUND PARTICLES ================= */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, i) => (
          <span
            key={i}
            className="dashboard-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="dashboard-sidebar relative z-10">
        {/* ================= LOGO ================= */}

        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <Leaf size={21} />
          </div>

          <div>
            <h2>
              Kisan<span>Mitra</span>
            </h2>

            <p>SMART FARMING</p>
          </div>
        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="sidebar-navigation">
          {menuGroups.map((group) => (
            <div className="sidebar-group" key={group.label}>
              <p className="sidebar-label">{group.label}</p>

              {group.items.map((item) => (
                <button
                  key={item.name}
                  className={`sidebar-item ${
                    active === item.name ? "active" : ""
                  }`}
                  onClick={() => {
                    setActive(item.name);

                    if (item.name === "Dashboard") {
                      navigate("/dashboard");
                    }

                    if (item.name === "Products") {
                      navigate("/admin-products");
                    }

                    if (item.name === "Farmers") {
                      navigate("/farmers");
                    }

                    if (item.name === "Buyers") {
                      navigate("/buyers");
                    }

                    if (item.name === "Orders") {
                      navigate("/orders");
                    }

                    if (item.name === "Market Insights") {
                      navigate("/market-insights");
                    }
                  }}
                >
                  <span className="sidebar-item-icon">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>

                  {active === item.name && (
                    <span className="active-indicator" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* ================= BOTTOM ================= */}

        <div className="sidebar-bottom">
          <button className="sidebar-item">
            <span className="sidebar-item-icon">
              <Settings size={18} />
            </span>
            Settings
          </button>

          <button className="sidebar-item">
            <span className="sidebar-item-icon">
              <CircleHelp size={18} />
            </span>
            Help & Support
          </button>

          {/* ================= ADMIN ================= */}

          <div className="admin-profile">
            <div className="admin-avatar">
              <UserRound size={18} />
            </div>

            <div className="admin-info">
              <p>{admin?.name || "Administrator"}</p>
              <span>Administrator</span>
            </div>

            <ChevronDown
              size={16}
              className="admin-chevron"
            />
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-main relative z-10">
        {/* =====================================================
            MARKET INTELLIGENCE
        ===================================================== */}

        <section className="market-section">
          {/* ================= SECTION HEADING ================= */}

          <div className="section-heading">
            <div>
              <p>LIVE MARKET DATA</p>

              <h2>Market Intelligence</h2>
            </div>

            <div className="live-status">
              <span />
              Live
            </div>
          </div>

          {/* ===================================================
              MAP
          =================================================== */}

          <div className="market-map">
            <div className="map-glow" />

            <div className="map-grid" />

            {/* ================= FAKE MAP ROADS ================= */}

            <div className="road road-one" />
            <div className="road road-two" />
            <div className="road road-three" />
            <div className="road road-four" />

            {/* ================= MAP MARKERS ================= */}

            <div className="map-marker supply marker-one">
              <span>₹</span>
            </div>

            <div className="map-marker demand marker-two">
              <span>!</span>
            </div>

            <div className="map-marker price marker-three">
              <span>₹</span>
            </div>

            <div className="map-marker supply marker-four">
              <span>₹</span>
            </div>

            {/* ================= MARKER CARD 1 ================= */}

            <div className="map-info-card card-one">
              <div className="info-dot supply-dot" />

              <div>
                <b>Tomato Supply</b>

                <span>2.4 tonnes</span>
              </div>
            </div>

            {/* ================= MARKER CARD 2 ================= */}

            <div className="map-info-card card-two">
              <div className="info-dot demand-dot" />

              <div>
                <b>High Demand</b>

                <span>Bengaluru</span>
              </div>
            </div>

            {/* ================= MARKER CARD 3 ================= */}

            <div className="map-info-card card-three">
              <div className="info-dot price-dot" />

              <div>
                <b>Mandi Price</b>

                <span>₹2,850 / qtl</span>
              </div>
            </div>

            {/* ================= LEGEND ================= */}

            <div className="map-legend">
              <p>MARKET SIGNALS</p>

              <div>
                <span className="legend-dot supply-dot" />
                Supply
              </div>

              <div>
                <span className="legend-dot demand-dot" />
                High Demand
              </div>

              <div>
                <span className="legend-dot price-dot" />
                Mandi Price
              </div>
            </div>
          </div>

          {/* ===================================================
              ACTIONS
          ===================================================== */}

          <div className="market-actions">
            {/* ================= FIND BUYERS ================= */}

            <button className="market-action primary">
              <span>
                <ShoppingCart size={19} />
              </span>

              <div>
                <b>Find Buyers</b>

                <small>Discover nearby demand</small>
              </div>

              <Navigation size={17} />
            </button>

            {/* ================= OPTIMIZE ROUTE ================= */}

            <button className="market-action">
              <span>
                <Truck size={19} />
              </span>

              <div>
                <b>Optimize Route</b>

                <small>Find the best delivery path</small>
              </div>

              <Navigation size={17} />
            </button>

            <button
              className="market-action"
              onClick={() => navigate("/market-insights")}
            >
              <span>
                <TrendingUp size={19} />
              </span>

              <div>
                <b>Market Insights</b>

                <small>View market prices and demand</small>
              </div>

              <Navigation size={17} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;