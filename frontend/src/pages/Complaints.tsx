import { API_BASE } from "../config";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CircleHelp,
  Leaf,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

type Buyer = {
  sid: number;
  name: string;
  email: string;
};

type Complaint = {
  sid: number;
  user_type: "buyer" | "farmer";
  user_sid: number;
  category: string;
  subject: string;
  description: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  admin_response: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function Complaints() {
  const navigate = useNavigate();

  const pageRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const [buyer] = useState<Buyer | null>(() => {
    const stored = localStorage.getItem("buyer");

    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState<number | null>(
    null
  );
  const [error, setError] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".complaint-header", {
        y: -25,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
      });

      gsap.from(".complaint-card", {
        y: 35,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: "power3.out",
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!particlesRef.current) return;

    const particles =
      particlesRef.current.querySelectorAll(
        ".complaint-particle"
      );

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


  useEffect(() => {
    fetchMyComplaints();
  }, [buyer?.sid]);

  async function fetchMyComplaints() {
    if (!buyer?.sid) {
      setLoadingComplaints(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/complaints/buyer/${buyer.sid}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to fetch complaints"
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("FETCH MY COMPLAINTS ERROR:", err);
    } finally {
      setLoadingComplaints(false);
    }
  }

  async function submitComplaint() {
    setError("");

    if (!category || !subject.trim() || !description.trim()) {
      setError("Please fill in all complaint details.");
      return;
    }

    if (!buyer?.sid) {
      setError("Buyer information is unavailable. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE}/api/complaints`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_type: "buyer",
            user_sid: buyer.sid,
            category,
            subject: subject.trim(),
            description: description.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to submit complaint"
        );
      }

      setComplaintId(data.complaint?.sid || data.sid || null);
      await fetchMyComplaints();
      setSubmitted(true);
    } catch (err) {
      console.error("COMPLAINT ERROR:", err);
      setError(
        "Unable to submit your complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setCategory("");
    setSubject("");
    setDescription("");
    setComplaintId(null);
    setSubmitted(false);
    setError("");
  }

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#050705] text-white"
    >
      {/* PARTICLES */}

      <div
        ref={particlesRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: 70 }).map((_, index) => (
          <span
            key={index}
            className="complaint-particle absolute h-[6px] w-[6px] rounded-full bg-[#39ff14]"
            style={{
              boxShadow:
                "0 0 7px #39ff14, 0 0 16px #39ff14, 0 0 28px rgba(57,255,20,.55)",
            }}
          />
        ))}
      </div>

      <main className="relative z-10 mx-auto min-h-screen max-w-[1000px] px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}

        <div className="complaint-header mb-8">
          <button
            onClick={() => navigate("/buyer-dashboard")}
            className="mb-6 flex items-center gap-2 rounded-xl border border-[#3f6f3f] bg-[#132013] px-4 py-2.5 text-sm font-medium text-[#8fbd8f] transition-all duration-200 hover:bg-[#1b2d1b] hover:text-[#b4d8b4]"
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
                Help & Support
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                General Complaints
              </h1>

              <p className="mt-1 text-sm text-white/35">
                Tell us about an issue and our team will review it.
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS */}

        {submitted ? (
          <section className="complaint-card rounded-2xl border border-[#7f9f5c]/20 bg-[#090c09] p-8 shadow-[8px_8px_25px_rgba(0,0,0,.45)] sm:p-12">
            <div className="mx-auto flex max-w-xl flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7f9f5c]/10 text-[#91ad68]">
                <CheckCircle2 size={32} />
              </div>

              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#39ff14]/60">
                Complaint Submitted
              </p>

              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                We've received your complaint.
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/35">
                Your complaint has been successfully submitted.
                Our support team can review it and update its
                status.
              </p>

              {complaintId && (
                <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#0c100c] px-6 py-4">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                    Complaint ID
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#91ad68]">
                    KM-{complaintId}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="rounded-xl border border-[#3f6f3f] bg-[#132013] px-5 py-3 text-sm font-medium text-[#8fbd8f] transition hover:bg-[#1b2d1b]"
                >
                  Submit Another
                </button>

                <button
                  onClick={() =>
                    navigate("/buyer-dashboard")
                  }
                  className="rounded-xl bg-[#7f9f5c] px-5 py-3 text-sm font-semibold text-[#081007] transition hover:bg-[#91ad68]"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </section>
        ) : (
          /* FORM */

          <section className="complaint-card rounded-2xl border border-white/[0.08] bg-[#090c09] p-6 shadow-[8px_8px_25px_rgba(0,0,0,.45)] sm:p-8">
            {/* USER */}

            <div className="mb-8 flex items-center gap-4 rounded-xl border border-white/[0.06] bg-[#0c100c] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#101510] text-[#91ad68]">
                <Leaf size={18} />
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Submitting as
                </p>

                <p className="mt-1 text-sm font-semibold text-white/70">
                  {buyer?.name || "Buyer"}
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-4 py-3 text-sm text-red-300/75">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0"
                />
                {error}
              </div>
            )}

            {/* CATEGORY */}

            <div className="mb-6">
              <label className="mb-2 block text-xs font-medium text-white/55">
                Complaint Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#0c100c] px-4 text-sm text-white/65 outline-none transition focus:border-[#3f6f3f] focus:ring-1 focus:ring-[#3f6f3f]"
              >
                <option value="">
                  Select complaint category
                </option>
                <option value="product">
                  Product
                </option>
                <option value="payment">
                  Payment
                </option>
                <option value="delivery">
                  Delivery / Logistics
                </option>
                <option value="farmer">
                  Farmer / Seller
                </option>
                <option value="marketplace">
                  Marketplace
                </option>
                <option value="account">
                  Account
                </option>
                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {/* SUBJECT */}

            <div className="mb-6">
              <label className="mb-2 block text-xs font-medium text-white/55">
                Subject
              </label>

              <input
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="Briefly describe your issue"
                className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#0c100c] px-4 text-sm text-white/70 outline-none transition placeholder:text-white/20 focus:border-[#3f6f3f] focus:ring-1 focus:ring-[#3f6f3f]"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="mb-8">
              <label className="mb-2 block text-xs font-medium text-white/55">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Explain your complaint in detail..."
                rows={7}
                className="w-full resize-none rounded-xl border border-white/[0.07] bg-[#0c100c] px-4 py-3 text-sm leading-6 text-white/70 outline-none transition placeholder:text-white/20 focus:border-[#3f6f3f] focus:ring-1 focus:ring-[#3f6f3f]"
              />
            </div>

            {/* SUBMIT */}

            <div className="flex justify-end">
              <button
                onClick={submitComplaint}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl bg-[#7f9f5c] px-6 py-3.5 text-sm font-semibold text-[#081007] transition hover:bg-[#91ad68] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />

                {submitting
                  ? "Submitting..."
                  : "Submit Complaint"}
              </button>
            </div>
          </section>
        )}

        {/* MY COMPLAINTS */}

        <section className="mt-8">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#39ff14]/60">
              Complaint History
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-white">
              My Complaints
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Track your submitted complaints and support responses.
            </p>
          </div>

          {loadingComplaints ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#090c09] p-8 text-center">
              <p className="text-sm text-white/35">
                Loading your complaints...
              </p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-[#090c09] p-8 text-center">
              <CircleHelp
                size={32}
                className="mx-auto mb-3 text-white/15"
              />

              <p className="text-sm text-white/40">
                You haven't submitted any complaints yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint.sid}
                  className="rounded-2xl border border-white/[0.08] bg-[#090c09] p-6 shadow-[8px_8px_25px_rgba(0,0,0,.35)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-[#7f9f5c]/10 px-3 py-1 text-xs font-semibold text-[#91ad68]">
                          KM-{complaint.sid}
                        </span>

                        <span
                          className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                            complaint.status === "resolved"
                              ? "border-green-500/20 bg-green-500/10 text-green-300"
                              : complaint.status === "under_review"
                              ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-300"
                              : complaint.status === "rejected"
                              ? "border-red-500/20 bg-red-500/10 text-red-300"
                              : "border-blue-500/20 bg-blue-500/10 text-blue-300"
                          }`}
                        >
                          {complaint.status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1)
                            )
                            .join(" ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white/80">
                        {complaint.subject}
                      </h3>

                      <p className="mt-1 text-xs text-white/30">
                        {complaint.category}
                      </p>
                    </div>

                    <p className="text-xs text-white/25">
                      {complaint.created_at
                        ? new Date(
                            complaint.created_at
                          ).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : ""}
                    </p>
                  </div>

                  <div className="mt-5 rounded-xl border border-white/[0.05] bg-[#0c100c] p-4">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-white/25">
                      Your Complaint
                    </p>

                    <p className="text-sm leading-6 text-white/50">
                      {complaint.description}
                    </p>
                  </div>

                  {complaint.admin_response ? (
                    <div className="mt-4 rounded-xl border border-[#7f9f5c]/10 bg-[#101510] p-4">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.15em] text-[#91ad68]/60">
                        Support Response
                      </p>

                      <p className="text-sm leading-6 text-white/55">
                        {complaint.admin_response}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-white/[0.05] bg-[#0c100c] px-4 py-3">
                      <p className="text-xs text-white/25">
                        No response from support yet.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Complaints;