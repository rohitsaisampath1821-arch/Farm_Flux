import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  User,
  TrendingUp,
  Truck,
} from "lucide-react";

const VIDEO_URL = "/videos/b9984103e8.mp4";

interface BuyerFormData {
  full_name: string;
  business_name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
}

function BuyerSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<BuyerFormData>({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter your location.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8000/api/buyers/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create account."
        );
      }

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* ================= BACKGROUND VIDEO ================= */}

      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={VIDEO_URL} type="video/mp4" />
      </video>

      {/* Dark / Green overlay */}
      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-br from-[#23351f]/70 via-transparent to-[#8a6737]/30" />

      {/* ================= PAGE ================= */}

      <div className="relative z-10 min-h-screen px-5 py-6 sm:px-8 lg:px-16">

        {/* ================= TOP BAR ================= */}

        <div className="mx-auto flex max-w-[1250px] items-center justify-between">

          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-lime-200/30 bg-lime-300/10 backdrop-blur-md">
              <Leaf
                size={25}
                className="text-lime-300"
              />
            </div>

            <div className="text-left">
              <div className="text-xl font-semibold tracking-tight">
                KisanMitra
              </div>

              <div className="text-xs text-white/55">
                Farmers Today, A Better Tomorrow
              </div>
            </div>
          </button>

          {/* Back */}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Login
          </button>
        </div>

        {/* ================= MAIN CARD ================= */}

        <div className="mx-auto mt-10 max-w-[1250px] overflow-hidden rounded-[30px] border border-white/15 bg-black/25 shadow-2xl backdrop-blur-2xl">

          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

            {/* ================= LEFT SIDE ================= */}

            <div className="relative flex flex-col justify-between border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">

              <div>

                {/* Icon */}

                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10">
                  <ShoppingCart
                    size={30}
                    className="text-lime-300"
                  />
                </div>

                <div className="mb-4 text-xs font-semibold tracking-[0.35em] text-lime-300/80">
                  BUYER PORTAL
                </div>

                <h1 className="max-w-md text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
                  Join a smarter
                  <br />
                  food supply chain.
                </h1>

                <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                  Create your buyer account and get direct
                  access to fresh, high-quality produce from
                  verified farmers and FPOs.
                </p>

                {/* Benefits */}

                <div className="mt-10 space-y-4">

                  <Benefit
                    icon={<Leaf size={19} />}
                    title="Fresh & Quality Produce"
                    description="Source directly from farmers"
                  />

                  <Benefit
                    icon={<TrendingUp size={19} />}
                    title="Transparent Pricing"
                    description="Access real-time market prices"
                  />

                  <Benefit
                    icon={<Truck size={19} />}
                    title="Reliable Supply"
                    description="Build long-term partnerships"
                  />

                </div>
              </div>

              {/* Quote */}

              <div className="mt-12">

                <p className="text-lg italic text-white/55">
                  "Good food builds stronger communities."
                </p>

                <div className="mt-4 flex items-center gap-4">

                  <div className="h-[2px] w-12 bg-lime-300" />

                  <span className="text-sm text-white/45">
                    KisanMitra
                  </span>

                </div>

              </div>
            </div>

            {/* ================= RIGHT SIDE ================= */}

            <div className="p-8 sm:p-10 lg:p-12">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-sm font-medium text-lime-300">
                  <ShoppingCart size={16} />
                  Buyer Portal
                </div>

                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/45">
                  Join KisanMitra as a buyer and start sourcing
                  directly from farmers.
                </p>

              </div>

              {/* ================= ERROR ================= */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* ================= SUCCESS ================= */}

              {success && (
                <div className="mb-5 flex items-center gap-2 rounded-xl border border-lime-300/20 bg-lime-300/10 px-4 py-3 text-sm text-lime-300">
                  <Check size={17} />
                  {success}
                </div>
              )}

              {/* ================= FORM ================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Full Name */}

                <InputField
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  icon={<User size={18} />}
                  required
                />

                {/* Business */}

                <InputField
                  label="Business / Organization"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  placeholder="Enter business name (optional)"
                  icon={<Building2 size={18} />}
                />

                {/* Email */}

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="buyer@example.com"
                  icon={<Mail size={18} />}
                  required
                />

                {/* Phone */}

                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  icon={<Phone size={18} />}
                />

                {/* Location */}

                <InputField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City / District / State"
                  icon={<MapPin size={18} />}
                  required
                />

                {/* Password */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-white/80">
                    Password <span className="text-lime-300">*</span>
                  </label>

                  <div className="relative">

                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                      className="h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] pl-12 pr-12 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-white/25 focus:border-lime-300/50 focus:bg-white/[0.08]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-white/35">
                    Use at least 8 characters with a number
                    and a special character.
                  </p>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-lime-300 px-6 font-semibold text-black transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Buyer Account
                      <ArrowRight
                        size={19}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

              </form>

              {/* ================= DIVIDER ================= */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-white/10" />

                <span className="text-xs text-white/30">
                  OR
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* ================= LOGIN ================= */}

              <div className="text-center text-sm text-white/45">

                Already have an account?

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="ml-2 font-medium text-lime-300 transition hover:text-lime-200"
                >
                  Sign in
                </button>

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
  icon: React.ReactNode;
  type?: string;
  required?: boolean;
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  required = false,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white/80">
        {label}{" "}
        {required && (
          <span className="text-lime-300">*</span>
        )}
      </label>

      <div className="relative">

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="h-14 w-full rounded-xl border border-white/15 bg-white/[0.06] pl-12 pr-4 text-sm text-white outline-none backdrop-blur-md transition placeholder:text-white/25 focus:border-lime-300/50 focus:bg-white/[0.08]"
        />

      </div>
    </div>
  );
}

/* =========================================================
   BENEFIT COMPONENT
========================================================= */

interface BenefitProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Benefit({
  icon,
  title,
  description,
}: BenefitProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-300/10 text-lime-300">
        {icon}
      </div>

      <div>
        <p className="text-sm font-medium text-white/80">
          {title}
        </p>

        <p className="mt-1 text-xs text-white/40">
          {description}
        </p>
      </div>

    </div>
  );
}

export default BuyerSignup;