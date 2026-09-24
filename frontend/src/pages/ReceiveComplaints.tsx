import { API_BASE } from "../config";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  Search,
  CircleHelp,
  User,
  CalendarDays,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Complaint = {
  sid: number;
  user_type: "farmer" | "buyer";
  user_sid: number;
  category: string;
  subject: string;
  description: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  admin_response: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function ReceiveComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingSid, setUpdatingSid] = useState<number | null>(null);
  const [responseDrafts, setResponseDrafts] = useState<Record<number, string>>({});
  const [statusDrafts, setStatusDrafts] = useState<
    Record<number, Complaint["status"]>
  >({});

  async function updateComplaint(complaint: Complaint) {
    const status = statusDrafts[complaint.sid] || complaint.status;
    const adminResponse =
      responseDrafts[complaint.sid] !== undefined
        ? responseDrafts[complaint.sid]
        : complaint.admin_response || "";

    try {
      setUpdatingSid(complaint.sid);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/complaints/${complaint.sid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            admin_response: adminResponse.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update complaint"
        );
      }

      await fetchComplaints();

      setResponseDrafts((prev) => {
        const next = { ...prev };
        delete next[complaint.sid];
        return next;
      });

      setStatusDrafts((prev) => {
        const next = { ...prev };
        delete next[complaint.sid];
        return next;
      });
    } catch (err) {
      console.error("COMPLAINT UPDATE ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update complaint."
      );
    } finally {
      setUpdatingSid(null);
    }
  }

  async function fetchComplaints() {
    try {
      setError("");

      const response = await fetch(
        `${API_BASE}/api/complaints`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to fetch complaints"
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("COMPLAINT FETCH ERROR:", err);
      setError("Unable to load complaints.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!loading) {
      gsap.from(".complaint-card", {
        y: 25,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
      });
    }
  }, [loading, complaints]);

  function handleRefresh() {
    setRefreshing(true);
    fetchComplaints();
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      String(complaint.sid).includes(query) ||
      String(complaint.user_sid).includes(query) ||
      complaint.user_type.toLowerCase().includes(query) ||
      complaint.category.toLowerCase().includes(query) ||
      complaint.subject.toLowerCase().includes(query) ||
      complaint.description.toLowerCase().includes(query) ||
      complaint.status.toLowerCase().includes(query)
    );
  });

  function getStatusStyle(status: Complaint["status"]) {
    switch (status) {
      case "resolved":
        return "border-green-500/20 bg-green-500/10 text-green-300";

      case "under_review":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

      case "rejected":
        return "border-red-500/20 bg-red-500/10 text-red-300";

      default:
        return "border-blue-500/20 bg-blue-500/10 text-blue-300";
    }
  }

  function formatStatus(status: string) {
    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }

  function formatDate(date: string | null) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050705] text-white">
      <main className="relative z-10 mx-auto min-h-screen max-w-[1250px] px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-5 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b]"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#7f9f5c]/20 bg-[#101510] text-[#91ad68]">
                <CircleHelp size={23} />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-[#39ff14]/60">
                  Admin Support
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Help & Support
                </h1>

                <p className="mt-1 text-sm text-white/35">
                  Complaints received from farmers and buyers.
                </p>
              </div>
            </div>
          </div>

          {/* REFRESH */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-5 py-3 text-sm font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b] disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <RefreshCw size={17} />
            )}

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* SEARCH */}
        <div className="mb-6">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search complaints..."
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#090c09] pl-11 pr-4 text-sm text-white/70 outline-none transition placeholder:text-white/20 focus:border-[#3f6f3f]"
            />
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <Loader2 size={20} className="animate-spin" />
              Loading complaints...
            </div>
          </div>
        ) : filteredComplaints.length === 0 ? (
          /* EMPTY */
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-[#090c09]">
            <MessageSquare
              size={40}
              className="mb-4 text-white/15"
            />

            <h2 className="text-lg font-semibold text-white/60">
              No complaints found
            </h2>

            <p className="mt-2 text-sm text-white/25">
              {search
                ? "Try a different search."
                : "There are no complaints yet."}
            </p>
          </div>
        ) : (
          <>
            {/* SUMMARY */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-white/35">
                Showing{" "}
                <span className="font-semibold text-white/60">
                  {filteredComplaints.length}
                </span>{" "}
                complaint
                {filteredComplaints.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>

            {/* COMPLAINTS */}
            <div className="space-y-5">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.sid}
                  className="complaint-card rounded-2xl border border-white/[0.08] bg-[#090c09] p-6 shadow-[8px_8px_25px_rgba(0,0,0,.35)]"
                >
                  {/* TOP */}
                  <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 md:flex-row md:items-start md:justify-between">

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-[#7f9f5c]/10 px-3 py-1 text-xs font-semibold text-[#91ad68]">
                          KM-{complaint.sid}
                        </span>

                        <span
                          className={`rounded-lg border px-3 py-1 text-xs font-medium ${getStatusStyle(
                            complaint.status
                          )}`}
                        >
                          {formatStatus(complaint.status)}
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold text-white/85">
                        {complaint.subject}
                      </h2>

                      <p className="mt-1 text-xs text-white/30">
                        {complaint.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-white/30">
                      <CalendarDays size={15} />
                      {formatDate(complaint.created_at)}
                    </div>
                  </div>

                  {/* USER */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-[#0c100c] px-4 py-2.5">
                      <User
                        size={15}
                        className="text-[#91ad68]"
                      />

                      <span className="text-xs text-white/40">
                        {complaint.user_type}
                      </span>

                      <span className="text-xs font-semibold text-white/65">
                        #{complaint.user_sid}
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/[0.05] bg-[#0c100c] px-4 py-2.5 text-xs text-white/40">
                      Category:{" "}
                      <span className="text-white/65">
                        {complaint.category}
                      </span>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="mt-5 rounded-xl border border-white/[0.05] bg-[#0c100c] p-5">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Complaint
                    </p>

                    <p className="text-sm leading-7 text-white/55">
                      {complaint.description}
                    </p>
                  </div>

                  {/* ADMIN RESPONSE / UPDATE */}
                  <div className="mt-4 rounded-xl border border-[#7f9f5c]/10 bg-[#101510] p-5">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#91ad68]/60">
                        Admin Response
                      </p>

                      <select
                        value={
                          statusDrafts[complaint.sid] || complaint.status
                        }
                        onChange={(event) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [complaint.sid]: event.target.value as Complaint["status"],
                          }))
                        }
                        className="rounded-lg border border-white/[0.08] bg-[#0c100c] px-3 py-2 text-xs text-white/70 outline-none focus:border-[#3f6f3f]"
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <textarea
                      value={
                        responseDrafts[complaint.sid] !== undefined
                          ? responseDrafts[complaint.sid]
                          : complaint.admin_response || ""
                      }
                      onChange={(event) =>
                        setResponseDrafts((prev) => ({
                          ...prev,
                          [complaint.sid]: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Write a response to the buyer/farmer..."
                      className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#0c100c] px-4 py-3 text-sm leading-6 text-white/70 outline-none placeholder:text-white/20 focus:border-[#3f6f3f]"
                    />

                    {complaint.admin_response &&
                      responseDrafts[complaint.sid] === undefined && (
                        <p className="mt-2 text-xs text-white/25">
                          Current response: {complaint.admin_response}
                        </p>
                      )}

                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => updateComplaint(complaint)}
                        disabled={updatingSid === complaint.sid}
                        className="flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-xs font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b] disabled:opacity-50"
                      >
                        {updatingSid === complaint.sid ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <MessageSquare size={15} />
                        )}
                        {updatingSid === complaint.sid
                          ? "Updating..."
                          : "Update Complaint"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ReceiveComplaints;