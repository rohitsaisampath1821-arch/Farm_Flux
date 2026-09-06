import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [loaded, setLoaded] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPassword, setBuyerPassword] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showBuyerPassword, setShowBuyerPassword] = useState(false);
  const [adminRemember, setAdminRemember] = useState(false);
  const [buyerRemember, setBuyerRemember] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [buyerError, setBuyerError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [buyerLoading, setBuyerLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAdminLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setAdminError("");
    setAdminLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: adminEmail.trim().toLowerCase(),
            password: adminPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setAdminError(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("admin", JSON.stringify(data.admin));
      localStorage.setItem("isAuthenticated", "true");

      if (adminRemember) {
        localStorage.setItem("adminRememberMe", "true");
      } else {
        localStorage.removeItem("adminRememberMe");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      setAdminError("Unable to connect to the server");
    } finally {
      setAdminLoading(false);
    }
  };

  const handleBuyerLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setBuyerError("");
    setBuyerLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/buyer/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: buyerEmail.trim().toLowerCase(),
            password: buyerPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setBuyerError(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("buyer", JSON.stringify(data.buyer));
      localStorage.setItem("buyerAuthenticated", "true");

      if (buyerRemember) {
        localStorage.setItem("buyerRememberMe", "true");
      } else {
        localStorage.removeItem("buyerRememberMe");
      }

      navigate("/buyer-dashboard");
    } catch (error) {
      console.error("Buyer login error:", error);
      setBuyerError("Unable to connect to the server");
    } finally {
      setBuyerLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#101411] text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/b9984103e8.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[#080c09]/35" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#101411]/40 via-transparent to-[#101411]/55" />

      <div
        className={`absolute left-[-12%] top-[20%] h-[420px] w-[420px] rounded-full bg-[#7da34f]/10 blur-[130px] transition-all duration-[1800ms] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute bottom-[-15%] right-[-5%] h-[420px] w-[420px] rounded-full bg-[#9fca72]/10 blur-[140px] transition-all duration-[2000ms] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* NAVBAR */}
      <nav
        className={`relative z-30 mx-auto flex w-[92%] max-w-7xl items-center justify-between py-6 transition-all duration-700 ${
          loaded
            ? "translate-y-0 opacity-100"
            : "-translate-y-6 opacity-0"
        }`}
      >
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#9fca72]/20 bg-[#9fca72]/10 backdrop-blur-xl transition-all duration-300 group-hover:bg-[#9fca72]/15">
            <Leaf size={20} className="text-[#b4d48f]" />
          </div>

          <div className="text-left">
            <p className="text-base font-semibold tracking-wide">
              KisanMitra
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
              Smart Agriculture
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate("/")}
          className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-medium text-white/65 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          Back to Home
        </button>
      </nav>

      {/* MAIN */}
      <main className="relative z-20 flex min-h-[calc(100vh-90px)] items-center justify-center px-5 pb-10">
        <div
          className={`relative flex w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.025] shadow-2xl backdrop-blur-xl transition-all duration-1000 ${
            loaded
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-[0.98] opacity-0"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 z-20 rounded-[30px] bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />

          {/* LEFT PANEL */}
          <section
            className={`relative flex w-[38%] shrink-0 flex-col justify-center border-r border-white/10 bg-white/[0.025] p-10 backdrop-blur-2xl transition-all duration-1000 delay-150 ${
              loaded
                ? "translate-x-0 opacity-100"
                : "-translate-x-8 opacity-0"
            }`}
          >
            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#9fca72]/20 bg-[#9fca72]/10">
              <LockKeyhole size={25} className="text-[#b4d48f]" />
            </div>

            <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-[#a8cf7a]">
              KisanMitra Access
            </p>

            <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight text-white">
              Manage the farming ecosystem.
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/45">
              Connect farmers, buyers, products and logistics through one
              intelligent agricultural platform.
            </p>

            <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#9fca72]/10">
                  <ShieldCheck
                    size={17}
                    className="text-[#b4d48f]"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium text-white/75">
                    Secure platform access
                  </p>
                  <p className="mt-1 text-[10px] text-white/35">
                    Choose your portal to continue
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT SIDE */}
          <section
            className={`relative flex min-w-0 flex-1 flex-col transition-all duration-1000 delay-300 ${
              loaded
                ? "translate-x-0 opacity-100"
                : "translate-x-8 opacity-0"
            }`}
          >
            {/* ADMIN PORTAL */}
            <div className="relative flex-1 bg-white/[0.025] p-7 backdrop-blur-2xl">
              <div className="relative z-10 flex h-full flex-col justify-center">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#9fca72]/20 bg-[#9fca72]/10 px-3 py-1.5 text-xs font-medium text-[#b4d48f]">
                  <ShieldCheck size={13} />
                  Admin Portal
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Welcome back
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                  Manage farmers, products, buyers and KisanMitra
                  operations.
                </p>

                <form
                  onSubmit={handleAdminLogin}
                  className="mt-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Email
                      </label>

                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          setAdminError("");
                        }}
                        placeholder="admin@kisanmitra.in"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#9fca72]/50 focus:bg-white/[0.06]"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Password
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showAdminPassword
                              ? "text"
                              : "password"
                          }
                          value={adminPassword}
                          onChange={(e) => {
                            setAdminPassword(e.target.value);
                            setAdminError("");
                          }}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 pr-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#9fca72]/50 focus:bg-white/[0.06]"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowAdminPassword(
                              !showAdminPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white"
                        >
                          {showAdminPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {adminError && (
                    <p className="mt-3 text-xs text-red-400">
                      {adminError}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-white/45">
                      <input
                        type="checkbox"
                        checked={adminRemember}
                        onChange={(e) =>
                          setAdminRemember(e.target.checked)
                        }
                        className="accent-[#9fca72]"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      className="text-xs text-[#a8cf7a] transition hover:text-[#c5e89a]"
                    >
                      Forgot password?
                    </button>

                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="group flex items-center gap-2 rounded-xl bg-[#9fca72] px-7 py-3 text-sm font-semibold text-[#101411] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b4d48f] hover:shadow-[0_10px_35px_rgba(159,202,114,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {adminLoading
                        ? "Signing in..."
                        : "Sign in"}

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="h-px w-full bg-white/10" />

            {/* BUYER PORTAL */}
            <div className="relative flex-1 bg-white/[0.02] p-7 backdrop-blur-2xl">
              <div className="relative z-10 flex h-full flex-col justify-center">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[#9fca72]/20 bg-[#9fca72]/10 px-3 py-1.5 text-xs font-medium text-[#b4d48f]">
                  <ShoppingCart size={13} />
                  Buyer Portal
                </div>

                <h2 className="text-3xl font-semibold tracking-tight">
                  Buy directly
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                  Access your buyer account and discover produce
                  directly from farmers and FPOs.
                </p>

                <form
                  onSubmit={handleBuyerLogin}
                  className="mt-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Email
                      </label>

                      <input
                        type="email"
                        value={buyerEmail}
                        onChange={(e) => {
                          setBuyerEmail(e.target.value);
                          setBuyerError("");
                        }}
                        placeholder="buyer@example.com"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#9fca72]/50 focus:bg-white/[0.06]"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-white/55">
                        Password
                      </label>

                      <div className="relative">
                        <input
                          type={
                            showBuyerPassword
                              ? "text"
                              : "password"
                          }
                          value={buyerPassword}
                          onChange={(e) => {
                            setBuyerPassword(e.target.value);
                            setBuyerError("");
                          }}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 pr-11 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#9fca72]/50 focus:bg-white/[0.06]"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowBuyerPassword(
                              !showBuyerPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white"
                        >
                          {showBuyerPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {buyerError && (
                    <p className="mt-3 text-xs text-red-400">
                      {buyerError}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-white/45">
                      <input
                        type="checkbox"
                        checked={buyerRemember}
                        onChange={(e) =>
                          setBuyerRemember(e.target.checked)
                        }
                        className="accent-[#9fca72]"
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      className="text-xs text-[#a8cf7a] transition hover:text-[#c5e89a]"
                    >
                      Forgot password?
                    </button>

                    <button
                      type="submit"
                      disabled={buyerLoading}
                      className="group flex items-center gap-2 rounded-xl border border-[#9fca72]/30 bg-[#9fca72]/10 px-7 py-3 text-sm font-semibold text-[#b4d48f] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9fca72]/50 hover:bg-[#9fca72]/15 hover:shadow-[0_10px_35px_rgba(159,202,114,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {buyerLoading
                        ? "Signing in..."
                        : "Enter Portal"}

                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </button>
                  </div>
                </form>

                <div className="mt-3 flex items-center gap-2 text-[10px] text-white/25">
                  <Truck size={12} />
                  Direct farm-to-market access
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Login;