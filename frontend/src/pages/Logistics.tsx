import { API_BASE } from "../config";
import { useEffect, useMemo, useRef, useState } from "react";
import { Truck, MapPin, Package, Users, Zap, RefreshCw, CheckCircle2, Leaf } from "lucide-react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import gsap from "gsap";

type Farmer = {
  farmer_id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  demand: number;
  stock: number;
  transport_cost: number;
};

type Buyer = {
  buyer_id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  demand: number;
};

type Connection = {
  farmer_id: number;
  buyer_id: number;
  demand: number;
  from: [number, number];
  to: [number, number];
};

type NetworkResponse = {
  farmers: Farmer[];
  buyers: Buyer[];
  connections: Connection[];
  total_demand: number;
  total_stock: number;
};

type Allocation = Farmer & {
  priority: number;
  allocated_quantity: number;
};

type ProcurementResponse = {
  required_quantity: number;
  total_allocated: number;
  remaining_quantity: number;
  allocations: Allocation[];
};

const API = import.meta.env.VITE_API_URL || `${API_BASE}`;

function FitNetwork({ farmers, buyers }: { farmers: Farmer[]; buyers: Buyer[] }) {
  const map = useMap();

  useEffect(() => {
    const points = [
      ...farmers.map((f) => [f.latitude, f.longitude] as [number, number]),
      ...buyers.map((b) => [b.latitude, b.longitude] as [number, number]),
    ];

    if (points.length === 1) {
      map.setView(points[0], 8);
      return;
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [45, 45], maxZoom: 8 });
    }
  }, [farmers, buyers, map]);

  return null;
}

function LocateMe() {
  const map = useMap();

  return (
    <button
      type="button"
      onClick={() => map.locate({ setView: true, maxZoom: 8 })}
      className="absolute right-4 top-4 z-[1000] rounded-xl border border-white/10 bg-[#050705]/90 px-3 py-2 text-xs text-white/70 backdrop-blur-md transition hover:border-[#39ff14]/40 hover:text-[#39ff14]"
    >
      <MapPin size={14} className="inline mr-1" />
      Locate
    </button>
  );
}

function Logistics() {
  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [totalDemand, setTotalDemand] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [requiredQuantity, setRequiredQuantity] = useState("");
  const [result, setResult] = useState<ProcurementResponse | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadNetwork = async () => {
    try {
      setLoadingData(true);
      setError("");

      const response = await fetch(`${API}/api/logistics/network`);
      if (!response.ok) throw new Error("Network API failed");

      const data: NetworkResponse = await response.json();

      setFarmers(data.farmers || []);
      setBuyers(data.buyers || []);
      setConnections(data.connections || []);
      setTotalDemand(Number(data.total_demand || 0));
      setTotalStock(Number(data.total_stock || 0));
    } catch (err) {
      console.error(err);
      setError("Unable to load farmer and buyer logistics data from the backend.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadNetwork();
  }, []);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles = gsap.utils.toArray<HTMLElement>(".logistics-particle");

    particles.forEach((particle) => {
      gsap.set(particle, {
        left: gsap.utils.random(0, 100) + "%",
        top: window.innerHeight + gsap.utils.random(0, 250),
        scale: gsap.utils.random(0.8, 1.8),
        opacity: gsap.utils.random(0.35, 0.8),
      });

      gsap.to(particle, {
        y: gsap.utils.random(-150, -50),
        x: gsap.utils.random(-30, 30),
        opacity: 0,
        duration: gsap.utils.random(3, 6),
        repeat: -1,
      });
    });

    return () => gsap.killTweensOf(particles);
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".logistics-card", {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const maxEdgeDemand = useMemo(
    () => Math.max(...connections.map((connection) => connection.demand), 1),
    [connections]
  );

  const runOptimization = async () => {
    const quantity = Number(requiredQuantity);

    if (!quantity || quantity <= 0) {
      setError("Enter a required quantity greater than 0.");
      return;
    }

    if (!farmers.length) {
      setError("No farmer data is available.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await fetch(`${API}/api/logistics/procurement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          required_quantity: quantity,
          farmers: farmers.map((farmer) => ({
            farmer_id: String(farmer.farmer_id),
            demand: farmer.demand,
            stock: farmer.stock,
            transport_cost: farmer.transport_cost,
          })),
        }),
      });

      if (!response.ok) throw new Error("Procurement API failed");

      const data: ProcurementResponse = await response.json();

      // Match each allocation to the farmer already loaded from MySQL.
      const allocations = data.allocations.map((item) => ({
        ...item,
        name:
          farmers.find(
            (farmer) => farmer.farmer_id === Number(item.farmer_id)
          )?.name ?? "Unknown Farmer",
      }));

      setResult({
        ...data,
        allocations,
      });
    } catch (err) {
      console.error(err);
      setError("Procurement optimization failed. Check the FastAPI server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#050705] text-white">
      <div ref={particlesRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: 70 }).map((_, i) => (
          <span
            key={i}
            className="logistics-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 mx-auto max-w-[1550px] px-6 py-8">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-[#39ff14]">
              DEMAND-DRIVEN LOGISTICS
            </p>
            <h1 className="text-4xl font-semibold tracking-tight">
              Smart Procurement & Logistics
            </h1>
            <p className="mt-2 text-sm text-white/45">
              Live farmer supply, buyer demand and demand-weighted procurement.
            </p>
          </div>

          <button
            onClick={loadNetwork}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/70 transition hover:border-[#39ff14]/30 hover:text-[#39ff14]"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_0.8fr]">
          <section className="logistics-card rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.06] p-2.5 text-[#39ff14]">
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="font-semibold">Farmer–Buyer Network</h2>
                  <p className="text-xs text-white/40">
                    Green = farmer supply · Blue = buyer demand
                  </p>
                </div>
              </div>

              <span className="flex items-center gap-2 rounded-full border border-[#39ff14]/20 bg-[#39ff14]/[0.05] px-3 py-1.5 text-xs text-[#39ff14]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#39ff14]" />
                Live Database
              </span>
            </div>

            <div className="relative h-[520px] overflow-hidden rounded-2xl border border-white/[0.08]">
              {loadingData ? (
                <div className="flex h-full items-center justify-center bg-black/40 text-sm text-white/35">
                  Loading network...
                </div>
              ) : (
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={5}
                  minZoom={4}
                  maxZoom={10}
                  scrollWheelZoom
                  zoomControl
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <FitNetwork farmers={farmers} buyers={buyers} />
                  <LocateMe />

                  {connections.map((connection, index) => {
                    const width =
                      1.5 + (connection.demand / maxEdgeDemand) * 6;

                    return (
                      <Polyline
                        key={`${connection.farmer_id}-${connection.buyer_id}-${index}`}
                        positions={[connection.from, connection.to]}
                        pathOptions={{
                          color: "#39ff14",
                          weight: width,
                          opacity: 0.45 + (connection.demand / maxEdgeDemand) * 0.45,
                        }}
                      >
                        <Tooltip sticky>
                          Demand: {connection.demand.toFixed(2)} kg
                        </Tooltip>
                      </Polyline>
                    );
                  })}

                  {farmers.map((farmer) => (
                    <CircleMarker
                      key={`farmer-${farmer.farmer_id}`}
                      center={[farmer.latitude, farmer.longitude]}
                      radius={9}
                      pathOptions={{
                        color: "#39ff14",
                        fillColor: "#39ff14",
                        fillOpacity: 0.9,
                        weight: 2,
                      }}
                    >
                      <Tooltip direction="top">
                        <strong>{farmer.name}</strong>
                        <br />
                        {farmer.location}
                        <br />
                        Demand: {farmer.demand.toFixed(2)} kg
                        <br />
                        Stock: {farmer.stock.toFixed(2)} kg
                      </Tooltip>
                    </CircleMarker>
                  ))}

                  {buyers.map((buyer) => (
                    <CircleMarker
                      key={`buyer-${buyer.buyer_id}`}
                      center={[buyer.latitude, buyer.longitude]}
                      radius={7}
                      pathOptions={{
                        color: "#72a8ff",
                        fillColor: "#72a8ff",
                        fillOpacity: 0.9,
                        weight: 2,
                      }}
                    >
                      <Tooltip direction="top">
                        <strong>{buyer.name}</strong>
                        <br />
                        {buyer.location}
                        <br />
                        Demand: {buyer.demand.toFixed(2)} kg
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              )}

              <div className="absolute bottom-4 left-4 z-[1000] rounded-2xl border border-white/10 bg-[#050705]/90 px-4 py-3 text-xs backdrop-blur-md">
                <div className="mb-2 font-semibold text-white/70">NETWORK SIGNALS</div>
                <div className="space-y-2 text-white/55">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#39ff14]" />
                    Farmer / Supply
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#72a8ff]" />
                    Buyer / Demand
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-[3px] w-4 rounded bg-[#39ff14]" />
                    Demand connection
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="logistics-card rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.06] p-2.5 text-[#39ff14]">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="font-semibold">Run Procurement Optimization</h2>
                <p className="text-xs text-white/40">
                  Demand + stock + transport cost
                </p>
              </div>
            </div>

            <label className="mb-2 block text-xs text-white/45">
              Required quantity (kg)
            </label>

            <input
              type="number"
              min="1"
              value={requiredQuantity}
              onChange={(e) => setRequiredQuantity(e.target.value)}
              placeholder="Enter required quantity"
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-[#39ff14]/40"
            />

            <button
              onClick={runOptimization}
              disabled={loading || loadingData}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#39ff14] px-4 py-3 font-semibold text-black transition hover:shadow-[0_0_30px_rgba(57,255,20,.2)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Truck size={18} />
              {loading ? "Optimizing..." : "Run Procurement Optimization"}
            </button>

            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-black/30 p-4">
              {[
                "Demand weights from orders",
                "Farmer priority calculation",
                "Available stock validation",
                "Procurement allocation",
              ].map((step) => (
                <div key={step} className="flex items-center gap-3 py-2 text-sm text-white/55">
                  <CheckCircle2 size={16} className="text-[#39ff14]" />
                  {step}
                </div>
              ))}

              {result && (
                <div className="mt-3 rounded-xl border border-[#39ff14]/20 bg-[#39ff14]/[0.06] p-3 text-sm text-[#39ff14]">
                  Optimization complete.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="logistics-card rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <Users size={19} className="text-[#39ff14]" />
              <h2 className="font-semibold">Live Network Metrics</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <Users size={16} className="mb-3 text-[#39ff14]" />
                <p className="text-2xl font-semibold">{farmers.length}</p>
                <p className="text-xs text-white/35">Farmers</p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <Users size={16} className="mb-3 text-[#72a8ff]" />
                <p className="text-2xl font-semibold">{buyers.length}</p>
                <p className="text-xs text-white/35">Buyers</p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <Package size={16} className="mb-3 text-[#39ff14]" />
                <p className="text-2xl font-semibold">{totalDemand.toFixed(0)} kg</p>
                <p className="text-xs text-white/35">Observed Demand</p>
              </div>

              <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                <Leaf size={16} className="mb-3 text-[#39ff14]" />
                <p className="text-2xl font-semibold">{totalStock.toFixed(0)} kg</p>
                <p className="text-xs text-white/35">Available Stock</p>
              </div>
            </div>
          </section>

          <section className="logistics-card rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <Package size={19} className="text-[#39ff14]" />
              <h2 className="font-semibold">Allocation Summary</h2>
            </div>

            {!result ? (
              <div className="py-14 text-center text-sm text-white/30">
                Run the optimizer to see the database-driven allocation.
              </div>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                    <p className="text-xs text-white/35">Required</p>
                    <p className="mt-1 text-xl font-semibold">{result.required_quantity} kg</p>
                  </div>
                  <div className="rounded-xl border border-[#39ff14]/15 bg-[#39ff14]/[0.04] p-4">
                    <p className="text-xs text-white/35">Allocated</p>
                    <p className="mt-1 text-xl font-semibold text-[#39ff14]">
                      {result.total_allocated.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.07] bg-black/25 p-4">
                    <p className="text-xs text-white/35">Remaining</p>
                    <p className="mt-1 text-xl font-semibold">
                      {result.remaining_quantity.toFixed(2)} kg
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-white/[0.035] text-xs text-white/40">
                      <tr>
                        <th className="px-4 py-3">Farmer</th>
                        <th className="px-4 py-3">Demand</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Allocated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {result.allocations.map((item) => (
                        <tr key={item.farmer_id}>
                          <td className="px-4 py-3 font-medium">{item.name}</td>
                          <td className="px-4 py-3">{item.demand.toFixed(2)} kg</td>
                          <td className="px-4 py-3">{item.stock.toFixed(2)} kg</td>
                          <td className="px-4 py-3 text-[#39ff14]">
                            {item.priority.toFixed(4)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#39ff14]">
                            {item.allocated_quantity.toFixed(2)} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>

        <section className="logistics-card mt-5 rounded-3xl border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <MapPin size={19} className="text-[#39ff14]" />
            <div>
              <h2 className="font-semibold">Demand-Weighted Procurement</h2>
              <p className="text-xs text-white/40">
                Connection thickness represents real ordered demand between buyers and farmers.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-black/25 p-5">
            <div className="mb-5 text-center">
              <span className="rounded-full border border-[#39ff14]/20 bg-[#39ff14]/[0.05] px-4 py-2 text-sm text-[#39ff14]">
                Priority = Demand ÷ (1 + Transport Cost)
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {farmers.map((farmer) => {
                const maxDemand = Math.max(...farmers.map((item) => item.demand), 1);
                const width = Math.max((farmer.demand / maxDemand) * 100, 8);

                return (
                  <div
                    key={farmer.farmer_id}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-semibold">{farmer.name}</span>
                      <span className="text-xs text-[#39ff14]">
                        {farmer.demand.toFixed(0)} kg
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#39ff14]"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-white/35">
                      {farmer.location} · transport ₹{farmer.transport_cost.toFixed(0)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Logistics;