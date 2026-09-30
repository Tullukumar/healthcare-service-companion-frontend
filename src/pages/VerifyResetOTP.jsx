import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function VerifyResetOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = sessionStorage.getItem("passwordResetEmail");

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email) {
      setError(
        "Password reset session has expired. Please start again."
      );
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError("OTP must contain 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
 "http://localhost:5000/api/auth/otp/verify",
{
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      identifier: email,
      type: "email",
      purpose: "forgot-password",
      otp: otp.trim(),
    }),
  }
);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid OTP."
        );
      }

      // Save verification token for reset password page
      sessionStorage.setItem(
        "passwordResetVerificationToken",
        data.verificationToken
      );

      navigate("/reset-password");
    } catch (error) {
      console.error(
        "Reset OTP verification error:",
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8">

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

      <div className="relative z-10 w-full max-w-md">

        {/* ========================================== */}
        {/* BRAND */}
        {/* ========================================== */}

        <div className="mb-8 text-center">

          <Link
            to="/"
            className="inline-flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-lg shadow-blue-600/20">
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

          {/* HEADER */}

          <div className="px-7 pb-5 pt-8 text-center sm:px-9">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">

              <svg
                width="28"
                height="28"
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

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Verify your OTP
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Enter the 6-digit verification code
              sent to
            </p>

            <p className="mt-1 break-all text-sm font-semibold text-blue-400">
              {email || "your email address"}
            </p>

          </div>

          {/* FORM */}

          <div className="px-7 pb-8 sm:px-9">

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                <span className="mt-0.5 font-bold">
                  !
                </span>

                <span className="font-medium">
                  {error}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >

              {/* OTP */}

              <div>

                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Verification code
                </label>

                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    const value =
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                    setOtp(value);
                    setError("");
                  }}
                  placeholder="Enter 6-digit OTP"
                  autoComplete="one-time-code"
                  required
                  className="h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-center text-xl font-bold tracking-widest text-white outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                />

              </div>

              {/* VERIFY BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:bg-blue-500 hover:shadow-xl focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    Verifying...
                  </>
                ) : (
                  <>
                    Verify OTP

                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
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
                  </>
                )}

              </button>

            </form>

            {/* BACK */}

            <div className="mt-6 border-t border-white/10 pt-6 text-center">

              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M19 12H5"
                    strokeLinecap="round"
                  />

                  <path
                    d="m12 19-7-7 7-7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                Use a different email

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
            Your account information is protected
          </span>

        </div>

      </div>
    </main>
  );
}

export default VerifyResetOTP;