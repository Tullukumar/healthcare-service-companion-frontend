import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ResetPasswordNew() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
        "Password reset session is missing or expired. Please start again."
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
        throw new Error(
          data.message || "Unable to update password."
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
      setError(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
              🔐
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Create New Password
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Choose a strong password for your HealthCompanion account.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* New Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading}
              />
            </div>

            {/* Password requirement */}
            <p className="text-xs text-slate-500">
              Password must contain at least 6 characters.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordNew;