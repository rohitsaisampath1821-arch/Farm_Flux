import { API_BASE } from "../config";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ShoppingBag,
  MapPin,
  Package,
  User,
  CalendarDays,
  IndianRupee,
  ChevronDown,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Order {
  sid: number;
  buyer_sid: number;
  buyer_name: string | null;
  business_name: string | null;
  total_amount: number;
  status: string;
  delivery_address: string | null;
  order_date: string | null;
  item_count: number;
  total_quantity: number;
}

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  /* ================= FETCH ORDERS ================= */

  async function fetchOrders() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/admin/orders`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch orders");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to fetch orders");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setSelectedOrders([]);
    } catch (err) {
      console.error("ORDER FETCH ERROR:", err);
      setError("Unable to load orders from the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= SEARCH ================= */

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (!query) {
        return (
          statusFilter === "all" ||
          order.status?.toLowerCase() === statusFilter
        );
      }

      const matchesSearch = [
        order.sid?.toString(),
        order.buyer_sid?.toString(),
        order.buyer_name,
        order.business_name,
        order.delivery_address,
        order.status,
        order.total_amount?.toString(),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "all" ||
        order.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  /* ================= SELECT ORDER ================= */

  const toggleOrder = (sid: number) => {
    setSelectedOrders((prev) =>
      prev.includes(sid)
        ? prev.filter((id) => id !== sid)
        : [...prev, sid]
    );
  };

  /* ================= SELECT ALL ================= */

  const allFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((order) =>
      selectedOrders.includes(order.sid)
    );

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedOrders((prev) =>
        prev.filter(
          (id) =>
            !filteredOrders.some(
              (order) => order.sid === id
            )
        )
      );
    } else {
      setSelectedOrders((prev) => {
        const ids = new Set(prev);

        filteredOrders.forEach((order) => {
          ids.add(order.sid);
        });

        return Array.from(ids);
      });
    }
  };

  /* ================= DELETE ORDERS ================= */

  async function deleteSelectedOrders() {
    if (selectedOrders.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedOrders.length} selected order${
        selectedOrders.length > 1 ? "s" : ""
      } permanently?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      for (const sid of selectedOrders) {
        const response = await fetch(
          `${API_BASE}/api/orders/${sid}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to delete order"
          );
        }
      }

      setSelectedOrders([]);
      await fetchOrders();
    } catch (err) {
      console.error("DELETE ORDER ERROR:", err);
      setError("Unable to delete selected order(s).");
    } finally {
      setDeleting(false);
    }
  }

  /* ================= HELPERS ================= */

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

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

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const getStatusClasses = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "confirmed":
      case "processing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "shipped":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "cancelled":
      case "canceled":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "pending":
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  const statusOptions = useMemo(() => {
    const statuses = orders
      .map((order) => order.status?.toLowerCase())
      .filter(Boolean);

    return [...new Set(statuses)];
  }, [orders]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050705] text-white">
      {/* ================= MAIN ================= */}

      <main className="relative z-10 mx-auto min-h-screen max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </button>

            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#39ff14]/75">
              ORDER MANAGEMENT
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Orders
            </h1>

            <p className="mt-2 max-w-xl text-sm text-white/45">
              Orders placed through the KisanMitra marketplace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* DELETE */}

            {selectedOrders.length > 0 && (
              <button
                onClick={deleteSelectedOrders}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={16} />

                {deleting
                  ? "Deleting..."
                  : `Delete (${selectedOrders.length})`}
              </button>
            )}

            {/* REFRESH */}

            <button
              onClick={handleRefresh}
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

        {/* ================= STATS ================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/5 bg-[#090c09] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/35">
                Total Orders
              </span>
              <ShoppingBag size={18} className="text-[#39ff14]" />
            </div>
            <p className="text-2xl font-semibold">{orders.length}</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#090c09] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/35">
                Pending
              </span>
              <Package size={18} className="text-yellow-400" />
            </div>
            <p className="text-2xl font-semibold">
              {
                orders.filter(
                  (order) =>
                    order.status?.toLowerCase() === "pending"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#090c09] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/35">
                Total Value
              </span>
              <IndianRupee size={18} className="text-[#39ff14]" />
            </div>
            <p className="text-2xl font-semibold">
              ₹
              {formatAmount(
                orders.reduce(
                  (sum, order) =>
                    sum + Number(order.total_amount || 0),
                  0
                )
              )}
            </p>
          </div>
        </div>

        {/* ================= SEARCH ================= */}

        {!loading && !error && orders.length > 0 && (
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
                placeholder="Search orders, buyers, locations..."
                className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#090c09] pl-11 pr-4 text-sm text-white/75 outline-none shadow-[5px_5px_15px_rgba(0,0,0,.3)] transition-all placeholder:text-white/25 focus:border-[#3f6f3f] focus:ring-1 focus:ring-[#3f6f3f]"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-11 appearance-none rounded-xl border border-white/[0.07] bg-[#090c09] px-4 pr-10 text-sm text-white/70 outline-none focus:border-[#3f6f3f]"
                >
                  <option value="all" className="bg-[#090c09]">
                    All statuses
                  </option>

                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                      className="bg-[#090c09]"
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1)}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/30"
                />
              </div>

              <p className="text-xs text-white/30">
                {filteredOrders.length} of {orders.length} orders
              </p>
            </div>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/10 bg-[#0a0b0a] px-5 py-4 text-sm text-red-300/80 shadow-[7px_7px_18px_rgba(0,0,0,.4)]">
            {error}
          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading && orders.length === 0 && !error && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09] px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0d120d] text-[#39ff14]/70">
              <ShoppingBag size={28} />
            </div>

            <h2 className="text-xl font-semibold text-white">
              No orders available
            </h2>

            <p className="mt-2 max-w-md text-sm text-white/40">
              Orders placed by buyers will appear here automatically.
            </p>
          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09]">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <RefreshCw
                size={18}
                className="animate-spin text-[#39ff14]"
              />
              Loading orders...
            </div>
          </div>
        )}

        {/* ================= TABLE ================= */}

        {!loading && filteredOrders.length > 0 && !error && (
          <div className="overflow-hidden rounded-3xl border border-white/[0.05] bg-[#090c09] shadow-[10px_10px_25px_rgba(0,0,0,.45)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <th className="w-14 px-5 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 accent-[#39ff14]"
                      />
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Order
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Buyer
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Items
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Total
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Delivery
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.sid}
                      className="border-b border-white/[0.05] transition-colors hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-5">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.sid)}
                          onChange={() => toggleOrder(order.sid)}
                          className="h-4 w-4 accent-[#39ff14]"
                        />
                      </td>

                      <td className="px-5 py-5">
                        <span className="font-mono text-sm text-white/55">
                          #{order.sid}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39ff14]/5">
                            <User
                              size={17}
                              className="text-[#39ff14]"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-white/80">
                              {order.buyer_name || "Unknown Buyer"}
                            </p>

                            <p className="mt-0.5 text-xs text-white/30">
                              {order.business_name ||
                                `Buyer #${order.buyer_sid}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <p className="text-sm text-white/70">
                          {order.item_count}{" "}
                          {order.item_count === 1
                            ? "product"
                            : "products"}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {Number(order.total_quantity || 0)} total units
                        </p>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-1 text-sm font-medium text-white/80">
                          <IndianRupee size={14} />
                          {formatAmount(
                            Number(order.total_amount || 0)
                          )}
                        </div>
                      </td>

                      <td className="max-w-[240px] px-5 py-5">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-[#39ff14]"
                          />

                          <span className="line-clamp-2 text-xs leading-5 text-white/45">
                            {order.delivery_address ||
                              "No address provided"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center gap-2 text-xs text-white/45">
                          <CalendarDays size={14} />
                          {formatDate(order.order_date)}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium capitalize ${getStatusClasses(
                            order.status
                          )}`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading &&
          orders.length > 0 &&
          filteredOrders.length === 0 &&
          !error && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-white/[0.05] bg-[#090c09] text-center">
              <Search size={28} className="mb-4 text-white/20" />
              <h2 className="text-lg font-semibold text-white/70">
                No matching orders
              </h2>
              <p className="mt-2 text-sm text-white/30">
                Try changing your search or status filter.
              </p>
            </div>
          )}
      </main>
    </div>
  );
}

export default Orders;