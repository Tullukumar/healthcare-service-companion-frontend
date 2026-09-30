import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPasswordNew() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const email = sessionStorage.getItem("passwordResetEmail");
  const verificationToken = sessionStorage.getItem(
    "passwordResetVerificationToken"
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !verificationToken) {
      setError(
        "Password reset session is missing or expired. Please request a new OTP."
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
const response = await fetch(
 "http://localhost:5000/api/auth/reset-password-verified",
{
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      verificationToken,
      password,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
  console.error("Reset password API response:", data);

  const validationMessage =
    data.errors?.map(
      (item) => `${item.field}: ${item.message}`
    ).join(" | ");

  throw new Error(
    validationMessage ||
      data.message ||
      "Failed to update password."
  );
}

      setSuccess(
        "Password updated successfully. Redirecting to login..."
      );

      sessionStorage.removeItem("passwordResetEmail");
      sessionStorage.removeItem("passwordResetOTP");
      sessionStorage.removeItem("passwordResetVerificationToken");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Reset password error:", error);

      setError(
        error.message || "Unable to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
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

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">

          {/* Header */}
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
                  y="10"
                  width="16"
                  height="11"
                  rx="2"
                />

                <path d="M8 10V7a4 4 0 0 1 8 0v3" />

                <path
                  d="M12 14v3"
                  strokeLinecap="round"
                />
              </svg>

            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Create New Password
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Choose a strong password to secure your
              HealthCompanion account.
            </p>

            {email && (
              <p className="mt-2 break-all text-xs font-medium text-blue-400">
                {email}
              </p>
            )}
          </div>

          {/* Form */}
          <div className="px-7 pb-8 sm:px-9">

            {/* Error */}
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

            {/* Success */}
            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
              >
                <span className="mt-0.5 font-bold">
                  ✓
                </span>

                <span className="font-medium">
                  {success}
                </span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >

              {/* New Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  New Password
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
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
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
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8-0.5 1.5-1.3 2.8-2.3 3.9" />
                        <path d="M6.2 6.2C4.5 7.4 3.3 9.4 2 12c1.3 3.9 5 8 10 8 1 0 2-.2 2.9-.5" />
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
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>

                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-300"
                >
                  Confirm Password
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
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
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
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.7 4 10 8-0.5 1.5-1.3 2.8-2.3 3.9" />
                        <path d="M6.2 6.2C4.5 7.4 3.3 9.4 2 12c1.3 3.9 5 8 10 8 1 0 2-.2 2.9-.5" />
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
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />
                      </svg>
                    )}
                  </button>

                </div>
              </div>

              {/* Requirements */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                <p className="mb-3 text-sm font-semibold text-slate-300">
                  Password requirements
                </p>

                <div className="space-y-2 text-sm">

                  <div className="flex items-center gap-2">
                    <span
                      className={
                        password.length >= 6
                          ? "text-emerald-400"
                          : "text-slate-600"
                      }
                    >
                      {password.length >= 6
                        ? "✓"
                        : "○"}
                    </span>

                    <span
                      className={
                        password.length >= 6
                          ? "text-slate-300"
                          : "text-slate-500"
                      }
                    >
                      At least 6 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={
                        password &&
                        password === confirmPassword
                          ? "text-emerald-400"
                          : "text-slate-600"
                      }
                    >
                      {password &&
                      password === confirmPassword
                        ? "✓"
                        : "○"}
                    </span>

                    <span
                      className={
                        password &&
                        password === confirmPassword
                          ? "text-slate-300"
                          : "text-slate-500"
                      }
                    >
                      Passwords match
                    </span>
                  </div>

                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:bg-blue-500 hover:shadow-xl focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    Update Password

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

            {/* Back to login */}
            <div className="mt-6 border-t border-white/10 pt-6 text-center">

              <Link
                to="/login"
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

                Back to Login
              </Link>

            </div>
          </div>
        </div>

        {/* Security note */}
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

export default ResetPasswordNew;