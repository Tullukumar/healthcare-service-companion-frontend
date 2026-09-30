import { useEffect, useState } from "react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }
const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/users/profile`,
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        setProfile(data.user);
      } catch (error) {
        console.error("Profile error:", error);
        setError(error.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const getInitial = () => {
    if (!profile?.name) return "U";

    return profile.name
      .charAt(0)
      .toUpperCase();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-10">

          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            My Account
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            View your HealthCompanion account information and
            personal details.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400"
          >
            <span className="font-bold">!</span>

            <span className="font-medium">
              {error}
            </span>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-5 text-sm font-medium text-slate-500">
              Loading your profile...
            </p>

          </div>
        )}

        {/* Profile */}
        {profile && !loading && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">

            {/* Profile Hero */}
            <div className="relative overflow-hidden border-b border-white/10 px-7 py-9 sm:px-10">

              {/* Glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-5">

                  {/* Avatar */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-3xl font-bold text-blue-400 shadow-lg shadow-blue-500/10">
                    {getInitial()}
                  </div>

                  {/* User information */}
                  <div>

                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {profile.name || "User"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {profile.email || "Email not provided"}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      {profile.role || "patient"}

                    </div>

                  </div>

                </div>

                {/* Account status */}
                <div className="hidden rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-right sm:block">

                  <p className="text-xs font-medium uppercase tracking-widest text-slate-600">
                    Account
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    Active
                  </p>

                </div>

              </div>

            </div>

            {/* Information */}
            <div className="p-7 sm:p-10">

              <div className="flex items-end justify-between">

                <div>
                 <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Account Details
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    Personal Information
                  </h3>
                </div>

              </div>

              {/* Information Cards */}
              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                {/* Full Name */}
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:border-white/20 hover:bg-white/[0.07]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
                      </svg>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                      Full Name
                    </p>

                  </div>

                  <p className="mt-4 font-semibold text-white">
                    {profile.name || "Not provided"}
                  </p>

                </div>

                {/* Email */}
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:border-white/20 hover:bg-white/[0.07]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />
                        <path d="m3 7 9 6 9-6" />
                      </svg>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                      Email
                    </p>

                  </div>

                  <p className="mt-4 break-all font-semibold text-white">
                    {profile.email || "Not provided"}
                  </p>

                </div>

                {/* Phone */}
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:border-white/20 hover:bg-white/[0.07]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M6.5 3.5h3l1.5 4-2 1.5c1 2.2 2.8 4 5 5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.6 18.5 5.5 13.4 5.5 7.5c0-1.1.9-2 2-2Z" />
                      </svg>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                      Phone
                    </p>

                  </div>

                  <p className="mt-4 font-semibold text-white">
                    {profile.phone || "Not provided"}
                  </p>

                </div>

                {/* Role */}
                <div className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:border-white/20 hover:bg-white/[0.07]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                      Account Role
                    </p>

                  </div>

                  <p className="mt-4 font-semibold capitalize text-white">
                    {profile.role || "patient"}
                  </p>

                </div>

              </div>

              {/* Account ID */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400">
                    <svg
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="3"
                      />
                      <path d="M8 9h8M8 13h5M8 17h8" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                      Account ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-400">
                      {profile._id || "Not available"}
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default Profile;