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
  MapPin,
  Radio,
} from "lucide-react";
import gsap from "gsap";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const networkNodes = [
  { name: "Delhi", position: [28.6139, 77.209] as [number, number], status: "Hub" },
  { name: "Ahmedabad", position: [23.0225, 72.5714] as [number, number], status: "Active" },
  { name: "Mumbai", position: [19.076, 72.8777] as [number, number], status: "Hub" },
  { name: "Hyderabad", position: [17.385, 78.4867] as [number, number], status: "Active" },
  { name: "Visakhapatnam", position: [17.6868, 83.2185] as [number, number], status: "Active" },
  { name: "Bengaluru", position: [12.9716, 77.5946] as [number, number], status: "Hub" },
  { name: "Chennai", position: [13.0827, 80.2707] as [number, number], status: "Active" },
  { name: "Kolkata", position: [22.5726, 88.3639] as [number, number], status: "Active" },
];

const networkConnections = [
  ["Delhi", "Ahmedabad"], ["Delhi", "Mumbai"], ["Delhi", "Kolkata"],
  ["Mumbai", "Ahmedabad"], ["Mumbai", "Hyderabad"], ["Mumbai", "Bengaluru"],
  ["Ahmedabad", "Hyderabad"], ["Hyderabad", "Visakhapatnam"],
  ["Hyderabad", "Bengaluru"], ["Visakhapatnam", "Kolkata"],
  ["Visakhapatnam", "Chennai"], ["Bengaluru", "Chennai"],
].map(([from, to]) => ({
  from: networkNodes.find((n) => n.name === from)!.position,
  to: networkNodes.find((n) => n.name === to)!.position,
}));

function LocateUser() {
  const map = useMap();
  return (
    <button
      type="button"
      onClick={() => map.locate({ setView: true, maxZoom: 10 })}
      className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-[#7f9f5c]/30 bg-[#050705]/90 px-3 py-2 text-xs font-medium text-[#b9d69b] shadow-lg backdrop-blur-md transition hover:border-[#7f9f5c]/60 hover:bg-[#0b120b]"
    >
      <MapPin size={14} />
      Locate me
    </button>
  );
}

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

        // NEW — same sidebar styling
        { name: "Profit Impact", icon: <TrendingUp size={18} /> },
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

      gsap.from(".network-panel", {
        y: 15,
        opacity: 0,
        duration: 0.7,
        delay: 0.7,
        stagger: 0.12,
        ease: "power2.out",
      });

      gsap.from(".network-legend", {
        y: 15,
        opacity: 0,
        duration: 0.7,
        delay: 0.8,
        ease: "power2.out",
      });

      gsap.to(".network-node", {
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
      ".network-panel, .market-action"
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

    const particles =
      gsap.utils.toArray<HTMLElement>(".dashboard-particle");

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

                    if (item.name === "Logistics") {
                      navigate("/logistics");
                    }

                    if (item.name === "Market Insights") {
                      navigate("/market-insights");
                    }

                    if (item.name === "Mandi Prices") {
                      navigate("/mandi-prices");
                    }

                    if (item.name === "Forecast") {
                      navigate("/forecast");
                    }

                    // NEW
                    if (item.name === "Profit Impact") {
                      navigate("/profit-impact");
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

          <button
            className="sidebar-item"
            onClick={() => navigate("/receive-complaints")}
          >
            <span className="sidebar-item-icon">
              <CircleHelp size={18} />
            </span>
            Help & Support
          </button>

          <div className="admin-profile">
            <div className="admin-avatar"><UserRound size={18} /></div>
            <div className="admin-info">
              <p>{admin?.name || "Administrator"}</p>
              <span>Administrator</span>
            </div>
            <ChevronDown size={16} className="admin-chevron" />
          </div>
        </div>
      </aside>

      <main className="dashboard-main relative z-10">
        <section className="market-section">
          <div className="section-heading">
            <div>
              <p>KISANMITRA NETWORK</p>
              <h2>India Supply Network</h2>
            </div>
            <div className="live-status"><span />Network Live</div>
          </div>

          <div className="market-map overflow-hidden">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} minZoom={4} maxZoom={10} scrollWheelZoom zoomControl className="h-full w-full">
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocateUser />

              {networkConnections.map((connection, index) => (
                <Polyline key={index} positions={[connection.from, connection.to]} pathOptions={{ color: "#5f9146", weight: 2, opacity: 0.65, dashArray: "6 10" }} />
              ))}

              {networkNodes.map((node) => (
                <CircleMarker key={node.name} center={node.position} radius={8} pathOptions={{ color: "#b9d69b", fillColor: "#39ff14", fillOpacity: 0.95, weight: 2 }} className="network-node">
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <strong>{node.name}</strong><br />KisanMitra {node.status}
                  </Tooltip>
                </CircleMarker>
              ))}

              <Marker position={[20.5937, 78.9629]} icon={L.divIcon({ className: "india-center-marker", html: '<div style="width:18px;height:18px;border-radius:50%;border:2px solid #39ff14;background:#071007;box-shadow:0 0 18px #39ff14,0 0 35px rgba(57,255,20,.55);display:flex;align-items:center;justify-content:center;color:#39ff14;font-size:9px;font-weight:700;">KM</div>', iconSize: [18, 18], iconAnchor: [9, 9] })}>
                <Tooltip direction="top" offset={[0, -8]}>KisanMitra Network Core</Tooltip>
              </Marker>
            </MapContainer>

            <div className="network-panel absolute left-5 top-5 z-[999] rounded-2xl border border-[#7f9f5c]/20 bg-[#050705]/90 p-4 shadow-xl backdrop-blur-md">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#7f9f5c]">NETWORK STATUS</p>
              <div className="space-y-2 text-xs text-white/65">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_#39ff14]" />Active hubs</div>
                <div className="flex items-center gap-2"><span className="h-[2px] w-3 bg-[#7f9f5c]" />Supply connections</div>
                <div className="flex items-center gap-2"><Radio size={12} className="text-[#39ff14]" />GPS-enabled view</div>
              </div>
            </div>

            <div className="network-legend absolute bottom-5 right-5 z-[999] rounded-2xl border border-[#7f9f5c]/20 bg-[#050705]/90 px-4 py-3 text-xs text-white/70 shadow-xl backdrop-blur-md">
              <span className="font-semibold text-[#b9d69b]">8 connected hubs</span> · India network view
            </div>
          </div>

          <div className="market-actions">
            <button className="market-action primary">
              <span><ShoppingCart size={19} /></span>
              <div><b>Find Buyers</b><small>Discover nearby demand</small></div>
              <Navigation size={17} />
            </button>
            <button className="market-action" onClick={() => navigate("/logistics")}>
              <span><Truck size={19} /></span>
              <div><b>Optimize Route</b><small>Open smart procurement & logistics</small></div>
              <Navigation size={17} />
            </button>
            <button className="market-action" onClick={() => navigate("/market-insights")}>
              <span><TrendingUp size={19} /></span>
              <div><b>Market Insights</b><small>View market prices and demand</small></div>
              <Navigation size={17} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
