import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Leaf,
  RefreshCw,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Complaint = {
  sid: number;
  user_type: "buyer" | "farmer";
  user_sid: number;
  category: string;
  subject: string;
  description: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  admin_response?: string;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
};

function CheckComplaints() {
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".complaints-header", {
        y: -25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".complaints-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out",
      });

      gsap.from(".stat-card", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.3,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  /* PARTICLES */
  useEffect(() => {
    if (!particlesRef.current) return;

    const particles =
      gsap.utils.toArray<HTMLElement>(".complaint-particle");

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

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/complaints"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to fetch complaints"
        );
      }

      setComplaints(
        Array.isArray(data.complaints)
          ? data.complaints
          : []
      );
    } catch (err) {
      console.error("COMPLAINT FETCH ERROR:", err);

      setError("Unable to load complaints.");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(
    (complaint) => {
      const value = search.toLowerCase().trim();

      if (!value) return true;

      return (
        String(complaint.sid).includes(value) ||
        complaint.subject
          ?.toLowerCase()
          .includes(value) ||
        complaint.category
          ?.toLowerCase()
          .includes(value) ||
        complaint.description
          ?.toLowerCase()
          .includes(value) ||
        complaint.status
          ?.toLowerCase()
          .includes(value) ||
        complaint.user_name
          ?.toLowerCase()
          .includes(value) ||
        complaint.user_email
          ?.toLowerCase()
          .includes(value) ||
        complaint.user_type
          ?.toLowerCase()
          .includes(value)
      );
    }
  );

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = (
    status: Complaint["status"]
  ) => {
    if (status === "resolved") {
      return {
        label: "Resolved",
        className:
          "border-green-500/20 bg-green-500/10 text-green-400",
        icon: <CheckCircle2 size={14} />,
      };
    }

    if (status === "under_review") {
      return {
        label: "Under Review",
        className:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        icon: <Clock3 size={14} />,
      };
    }

    if (status === "rejected") {
      return {
        label: "Rejected",
        className:
          "border-red-500/20 bg-red-500/10 text-red-400",
        icon: <XCircle size={14} />,
      };
    }

    return {
      label: "Submitted",
      className:
        "border-[#7f9f5c]/20 bg-[#7f9f5c]/10 text-[#a5bf82]",
      icon: <AlertCircle size={14} />,
    };
  };

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-x-hidden bg-[#050705] text-white"
    >
      {/* PARTICLES */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, i) => (
          <span
            key={i}
            className="complaint-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 min-h-screen px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1450px]">

          {/* HEADER */}

          <div className="complaints-header mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>
              <button
                onClick={() => navigate("/dashboard")}
                className="mb-6 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
              >
                <ArrowLeft size={17} />
                Back to Dashboard
              </button>

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#7f9f5c]/20 bg-[#101510] text-[#91ad68]">
                  <CircleHelp size={23} />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-[#39ff14]/60">
                    Administration
                  </p>

                  <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                    Help & Support
                  </h1>

                  <p className="mt-1 text-sm text-white/35">
                    Review complaints submitted by KisanMitra customers.
                  </p>
                </div>

              </div>
            </div>

            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#7f9f5c]/25 bg-[#7f9f5c]/10 px-5 py-3 text-sm font-semibold text-[#a5bf82] transition hover:bg-[#7f9f5c]/20 disabled:opacity-40"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

          </div>

          {/* STATS */}

          <div className="mb-6 grid gap-4 sm:grid-cols-3">

            <StatCard
              label="Total Complaints"
              value={complaints.length}
              icon={<CircleHelp size={18} />}
            />

            <StatCard
              label="Pending"
              value={
                complaints.filter(
                  (item) =>
                    item.status === "submitted"
                ).length
              }
              icon={<Clock3 size={18} />}
            />

            <StatCard
              label="Resolved"
              value={
                complaints.filter(
                  (item) =>
                    item.status === "resolved"
                ).length
              }
              icon={<CheckCircle2 size={18} />}
            />

          </div>

          {/* COMPLAINT TABLE */}

          <section className="complaints-card overflow-hidden rounded-2xl border border-white/[0.08] bg-[#090c09] shadow-[8px_8px_25px_rgba(0,0,0,.45)]">

            {/* TOOLBAR */}

            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center">

              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/25">
                  Customer Support
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white/80">
                  Customer Complaints
                </h2>
              </div>

              <div className="relative w-full sm:w-[320px]">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search complaints..."
                  className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#0c100c] pl-9 pr-3 text-sm text-white/70 outline-none placeholder:text-white/20 focus:border-[#3f6f3f]"
                />

              </div>

            </div>

            {/* ERROR */}

            {error && (
              <div className="m-5 flex items-center gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-sm text-red-300/75">
                <AlertCircle size={17} />
                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#7f9f5c]/20 border-t-[#91ad68]" />

                  <p className="text-sm text-white/30">
                    Loading complaints...
                  </p>

                </div>

              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/25">
                  <CircleHelp size={22} />
                </div>

                <h3 className="text-lg font-semibold text-white/60">
                  No complaints found
                </h3>

                <p className="mt-2 max-w-md text-sm text-white/25">
                  No customer complaints are currently available.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1150px] border-collapse">

                  <thead>
                    <tr className="border-b border-white/[0.06] bg-[#0c100c] text-left">

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Complaint ID
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Customer
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Category
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Complaint
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Status
                      </th>

                      <th className="px-5 py-4 text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Submitted
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredComplaints.map(
                      (complaint) => {
                        const status = getStatus(
                          complaint.status
                        );

                        return (
                          <tr
                            key={complaint.sid}
                            className="border-b border-white/[0.05] transition hover:bg-white/[0.015]"
                          >

                            <td className="px-5 py-5 align-top">
                              <span className="font-mono text-xs text-[#91ad68]">
                                KM-{complaint.sid}
                              </span>
                            </td>

                            <td className="px-5 py-5 align-top">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#101510] text-[#91ad68]">
                                  <UserRound size={15} />
                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-white/70">
                                    {complaint.user_name ||
                                      "Unknown User"}
                                  </p>

                                  <p className="mt-1 text-[10px] text-white/25">
                                    {complaint.user_type}
                                  </p>

                                  {complaint.user_email && (
                                    <p className="mt-1 text-[10px] text-white/20">
                                      {complaint.user_email}
                                    </p>
                                  )}

                                </div>

                              </div>

                            </td>

                            <td className="px-5 py-5 align-top">

                              <span className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-1.5 text-xs capitalize text-white/50">
                                {complaint.category}
                              </span>

                            </td>

                            <td className="max-w-[420px] px-5 py-5 align-top">

                              <p className="text-sm font-semibold text-white/70">
                                {complaint.subject}
                              </p>

                              <p className="mt-2 line-clamp-3 text-xs leading-5 text-white/30">
                                {complaint.description}
                              </p>

                            </td>

                            <td className="px-5 py-5 align-top">

                              <span
                                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${status.className}`}
                              >
                                {status.icon}
                                {status.label}
                              </span>

                            </td>

                            <td className="px-5 py-5 align-top text-xs text-white/30">
                              {formatDate(
                                complaint.created_at
                              )}
                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat-card rounded-2xl border border-white/[0.08] bg-[#090c09] p-5 shadow-[7px_7px_18px_rgba(0,0,0,.35)]">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-[9px] uppercase tracking-[0.17em] text-white/25">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-white/80">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f9f5c]/15 bg-[#101510] text-[#91ad68]">
          {icon}
        </div>

      </div>

    </div>
  );
}

export default CheckComplaints;