import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });

  // ==========================================
  // VERIFICATION
  // ==========================================

  const [verificationType, setVerificationType] =
    useState("email");

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationToken, setVerificationToken] =
    useState("");

  const [step, setStep] = useState(1);

  // ==========================================
  // UI STATE
  // ==========================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const sendOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!identifier.trim()) {
      setError(
        `Please enter your ${
          verificationType === "email"
            ? "email address"
            : "phone number"
        }.`
      );
      return;
    }

    if (
      verificationType === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        identifier.trim()
      )
    ) {
      setError("Please enter a valid email address.");
      return;
    }

    if (
      verificationType === "phone" &&
      !/^[0-9]{10}$/.test(identifier.trim())
    ) {
      setError(
        "Please enter a valid 10-digit phone number."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/auth/otp/send`,
{
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

          body: JSON.stringify({
            identifier: identifier.trim(),
            type: verificationType,
            purpose: "register",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      setMessage(
        `Verification code sent to your ${
          verificationType === "email"
            ? "email"
            : "phone"
        }.`
      );

      setStep(2);
    } catch (error) {
      console.error("Send OTP error:", error);

      setError(
        error.message ||
          "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const verifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError("OTP must be 6 digits.");
      return;
    }

    try {
      setLoading(true);
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/auth/otp/verify`,
{
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

          body: JSON.stringify({
            identifier: identifier.trim(),
            type: verificationType,
            purpose: "register",
            otp: otp.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "OTP verification failed."
        );
      }

      setVerificationToken(
        data.verificationToken
      );

      setMessage("Verification successful.");

      setStep(3);
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error.message ||
          "Unable to verify OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CREATE ACCOUNT
  // ==========================================

  const createAccount = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (!verificationToken) {
      setError(
        "Your verification has expired. Please verify again."
      );
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/auth/register-verified`,
{
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },
          body: JSON.stringify({
            name: formData.name.trim(),
            identifier: identifier.trim(),
            type: verificationType,
            password: formData.password,
            role: formData.role,
            verificationToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Account creation failed."
        );
      }

      setMessage(
        "Account created successfully."
      );

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK
  // ==========================================

  const goBack = () => {
    setError("");
    setMessage("");

    if (step === 2) {
      setOtp("");
      setStep(1);
    }

    if (step === 3) {
      setVerificationToken("");
      setOtp("");
      setStep(2);
    }
  };

  // ==========================================
  // CHANGE EMAIL / PHONE
  // ==========================================

  const changeIdentifier = () => {
    setIdentifier("");
    setOtp("");
    setVerificationToken("");
    setMessage("");
    setError("");
    setStep(1);
  };

  // ==========================================
  // SHARED INPUT STYLE
  // ==========================================

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10";

  const buttonClass =
    "flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-white sm:px-8">

      {/* ========================================== */}
      {/* BACKGROUND */}
      {/* ========================================== */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-xl">

        {/* ========================================== */}
        {/* BRAND */}
        {/* ========================================== */}

        <div className="mb-8 text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
              +
            </div>

            <div className="text-left">

              <p className="text-lg font-bold tracking-tight text-white">
                HealthCompanion
              </p>

<p className="text-xs font-medium text-slate-500">
  Healthcare, connected
</p>

            </div>
          </Link>

        </div>

        {/* ========================================== */}
        {/* CARD */}
        {/* ========================================== */}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">

          <div className="p-7 sm:p-9">

            {/* ====================================== */}
            {/* PROGRESS */}
            {/* ====================================== */}

            <div className="mb-8">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Account setup
                </span>

                <span className="text-xs font-semibold text-blue-400">
                  Step {step} of 3
                </span>

              </div>

              <div className="flex gap-2">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      item <= step
                        ? "bg-blue-500"
                        : "bg-white/10"
                    }`}
                  />
                ))}

              </div>

            </div>

            {/* ====================================== */}
            {/* STEP 1 */}
            {/* ====================================== */}

            {step === 1 && (
              <>
                <div className="mb-8">

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="text-blue-400"
                    >
                      <path
                        d="M4 4h16v16H4z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      <path d="m4 6 8 6 8-6" />
                    </svg>

                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    Create your account
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Verify your email or mobile number
                    to get started.
                  </p>

                </div>

                <form
                  onSubmit={sendOTP}
                  className="space-y-5"
                  noValidate
                >

                  {/* VERIFICATION METHOD */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-300">
                      Verification method
                    </label>

                    <div className="grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        onClick={() => {
                          setVerificationType("email");
                          setIdentifier("");
                          setError("");
                          setMessage("");
                        }}
                        className={`h-12 rounded-xl border text-sm font-semibold transition ${
                          verificationType === "email"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        Email
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVerificationType("phone");
                          setIdentifier("");
                          setError("");
                          setMessage("");
                        }}
                        className={`h-12 rounded-xl border text-sm font-semibold transition ${
                          verificationType === "phone"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        Mobile
                      </button>

                    </div>

                  </div>

                  {/* IDENTIFIER */}

                  <div>

                    <label
                      htmlFor="identifier"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      {verificationType === "email"
                        ? "Email address"
                        : "Mobile number"}
                    </label>

                    <input
                      id="identifier"
                      type={
                        verificationType === "email"
                          ? "email"
                          : "tel"
                      }
                      value={identifier}
                      onChange={(event) => {
                        setIdentifier(
                          event.target.value
                        );
                        setError("");
                        setMessage("");
                      }}
                      placeholder={
                        verificationType === "email"
                          ? "Enter your email address"
                          : "Enter your 10-digit mobile number"
                      }
                      autoComplete={
                        verificationType === "email"
                          ? "email"
                          : "tel"
                      }
                      className={inputClass}
                    />

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                      {error}
                    </div>
                  )}

                  {/* MESSAGE */}

                  {message && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonClass}
                  >
                    {loading
                      ? "Sending code..."
                      : "Send verification code"}

                    {!loading && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="ml-2"
                      >
                        <path
                          d="M5 12h14"
                          strokeLinecap="round"
                        />

                        <path
                          d="m13 6 6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                </form>
              </>
            )}

            {/* ====================================== */}
            {/* STEP 2 */}
            {/* ====================================== */}

            {step === 2 && (
              <>
                <div className="mb-8">

                  <button
                    type="button"
                    onClick={goBack}
                    className="mb-5 text-sm font-semibold text-slate-500 transition hover:text-white"
                  >
                    ← Back
                  </button>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="text-blue-400"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="3"
                      />

                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>

                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    Verify your account
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Enter the 6-digit code sent to
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-blue-400">
                    {identifier}
                  </p>

                </div>

                <form
                  onSubmit={verifyOTP}
                  className="space-y-5"
                  noValidate
                >

                  <div>

                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Verification code
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setOtp(value);
                        setError("");
                        setMessage("");
                      }}
                      placeholder="Enter 6-digit code"
                      autoComplete="one-time-code"
                      className={`${inputClass} text-center text-xl font-bold tracking-widest`}
                    />

                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonClass}
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify code"}
                  </button>

                  <button
                    type="button"
                    onClick={changeIdentifier}
                    className="h-10 w-full text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                  >
                    Change email or mobile number
                  </button>

                </form>
              </>
            )}

            {/* ====================================== */}
            {/* STEP 3 */}
            {/* ====================================== */}

            {step === 3 && (
              <>
                <div className="mb-8">

                  <button
                    type="button"
                    onClick={goBack}
                    className="mb-5 text-sm font-semibold text-slate-500 transition hover:text-white"
                  >
                    ← Back
                  </button>

                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">

                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="text-blue-400"
                    >
                      <circle
                        cx="12"
                        cy="8"
                        r="3"
                      />

                      <path
                        d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"
                        strokeLinecap="round"
                      />
                    </svg>

                  </div>

                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    Complete your account
                  </h1>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Add your details and create a secure
                    password.
                  </p>

                </div>

                <form
                  onSubmit={createAccount}
                  className="space-y-5"
                  noValidate
                >

                  {/* VERIFIED */}

                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 font-bold text-emerald-400">
                      ✓
                    </div>

                    <div className="min-w-0">

                      <p className="text-sm font-semibold text-emerald-400">
                        Verified successfully
                      </p>

                      <p className="mt-0.5 break-all text-xs text-emerald-500/70">
                        {identifier}
                      </p>

                    </div>

                  </div>

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={inputClass}
                    />

                  </div>

                  {/* ROLE */}

                  <div>

                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Account type
                    </label>

                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none`}
                    >
                      <option
                        value="patient"
                        className="bg-slate-900"
                      >
                        Patient
                      </option>

                      <option
                        value="doctor"
                        className="bg-slate-900"
                      >
                        Doctor
                      </option>

                      <option
                        value="hospital"
                        className="bg-slate-900"
                      >
                        Hospital
                      </option>

                      <option
                        value="ambulance"
                        className="bg-slate-900"
                      >
                        Ambulance Provider
                      </option>

                      <option
                        value="admin"
                        className="bg-slate-900"
                      >
                        Admin
                      </option>
                    </select>

                  </div>

                  {/* PASSWORD */}

                  <div>

                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a password"
                        autoComplete="new-password"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M3 3l18 18" />

                            <path
                              d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5 9 5s-3.5 5-9 5-9-5-9-5 1.1-1.6 3.2-3.1"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            <circle
                              cx="12"
                              cy="12"
                              r="2.5"
                            />
                          </svg>
                        )}
                      </button>

                    </div>

                    <p className="mt-2 text-xs text-slate-600">
                      Minimum 6 characters.
                    </p>

                  </div>

                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Confirm password
                    </label>

                    <div className="relative">

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={
                          formData.confirmPassword
                        }
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        className={`${inputClass} pr-12`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/10 hover:text-white"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showConfirmPassword ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path d="M3 3l18 18" />

                            <path
                              d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5 9 5s-3.5 5-9 5-9-5-9-5 1.1-1.6 3.2-3.1"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <path
                              d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            <circle
                              cx="12"
                              cy="12"
                              r="2.5"
                            />
                          </svg>
                        )}
                      </button>

                    </div>

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                      {error}
                    </div>
                  )}

                  {/* SUCCESS */}

                  {message && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                      {message}
                    </div>
                  )}

                  {/* CREATE */}

                  <button
                    type="submit"
                    disabled={loading}
                    className={buttonClass}
                  >
                    {loading
                      ? "Creating account..."
                      : "Create account"}

                    {!loading && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="ml-2"
                      >
                        <path
                          d="M5 12h14"
                          strokeLinecap="round"
                        />

                        <path
                          d="m13 6 6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                </form>
              </>
            )}

            {/* ====================================== */}
            {/* LOGIN */}
            {/* ====================================== */}

            <div className="mt-8 border-t border-white/10 pt-6 text-center">

              <p className="text-sm text-slate-500">
                Already have an account?
              </p>

              <Link
                to="/login"
                className="mt-2 inline-block text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >
                Sign in
              </Link>

            </div>

          </div>

        </div>

        {/* SECURITY */}

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect
              x="4"
              y="10"
              width="16"
              height="11"
              rx="2"
            />

            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>

          <span>
            Secure account creation
          </span>

        </div>

      </div>
    </main>
  );
}

export default Register;