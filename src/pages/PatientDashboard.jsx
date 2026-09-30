import { Link } from "react-router-dom";
import AIAssistant from "../components/AIAssistant";

function PatientDashboard() {
  console.log("🔥 PATIENT DASHBOARD FILE LOADED");
  console.log("PATIENT DASHBOARD: AI SECTION");


  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const actions = [
    {
      title: "Find Doctors",
      description:
        "Search doctors by specialty, location, hospital, and availability.",
      path: "/find-doctors",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="7" r="3.5" />
          <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
          <path d="M18 8v5M15.5 10.5h5" />
        </svg>
      ),
    },

    {
      title: "My Appointments",
      description:
        "View and manage your upcoming and previous consultations.",
      path: "/appointments",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="3"
          />
          <path d="M16 3v4M8 3v4M3 10h18" />
          <path d="M8 14h3M8 17h5" />
        </svg>
      ),
    },

    {
  title: "Medical Records",
  description:
    "View your diagnosis, medications, medical history, doctor notes, and follow-up information.",
  path: "/medical-records",
  icon: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v4h4" />
      <path d="M8 11h8" />
      <path d="M8 15h8" />
      <path d="M8 19h5" />
    </svg>
  ),
},




    {
      title: "Hospitals",
      description:
        "Explore hospitals and healthcare facilities near you.",
      path: "/hospitals",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
          <path d="M2 21h20" />
          <path d="M9 7h6M12 4v6" />
          <path d="M9 14h2v3H9zM13 14h2v3h-2z" />
        </svg>
      ),
    },

    {
      title: "SevaCare",
      description:
        "Access healthcare support and community assistance services.",
      path: "/sevacare",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 12a8 8 0 1 1-2.34-5.66" />
          <path d="M20 4v6h-6" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
        </svg>
      ),
    },

    {
      title: "Emergency",
      description:
        "Get emergency healthcare assistance quickly.",
      path: "/emergency",
      emergency: true,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10h18v10H3z" />
          <path d="M7 10V7a5 5 0 0 1 10 0v3" />
          <path d="M12 13v4M10 15h4" />
        </svg>
      ),
    },

    {
      title: "Customer Support",
      description:
        "Get help with payments, doctors, appointments, hospitals, medicines, or other problems.",
      path: "/customer-support",
      support: true,
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M4 13v4a2 2 0 0 0 2 2h2v-6H6a2 2 0 0 0-2 2Z" />
          <path d="M20 13v4a2 2 0 0 1-2 2h-2v-6h2a2 2 0 0 1 2 2Z" />
          <path d="M16 19c-.7 1.2-2 2-4 2" />
        </svg>
      ),
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none absolute -left-40 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />

      {/* ==========================================
          BACKGROUND GRID
      ========================================== */}

      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* ==========================================
          MAIN CONTAINER
      ========================================== */}

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">

          <div className="relative z-10 max-w-3xl">

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Patient Dashboard
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Welcome back,{" "}
              <span className="text-blue-400">
                {user?.name || "Patient"}
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Manage your healthcare journey from one connected
              dashboard. Find doctors, hospitals, appointments,
              SevaCare services, emergency assistance, and
              customer support.
            </p>

          </div>

          {/* HEADER VISUAL */}

          <div className="pointer-events-none absolute -right-10 -top-10 hidden h-64 w-64 rounded-full border border-blue-500/10 bg-blue-500/5 lg:block">
            <div className="absolute inset-8 rounded-full border border-blue-500/10">
              <div className="absolute inset-8 rounded-full border border-blue-500/10" />
            </div>
          </div>

        </section>

        {/* ==========================================
            QUICK ACCESS
        ========================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Quick Access
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Your Healthcare
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Access important healthcare services from one place.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">

            {actions.map((action) => (
              <Link
                key={action.title}
                to={action.path}
                className={`group relative overflow-hidden rounded-3xl border p-6 shadow-xl transition duration-200 hover:-translate-y-1 ${
                  action.emergency
                    ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40"
                    : action.support
                    ? "border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40"
                    : "border-white/10 bg-slate-900/80 hover:border-blue-500/20 hover:bg-slate-900"
                }`}
              >

                {/* HOVER GLOW */}

                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${
                    action.emergency
                      ? "bg-red-500/10"
                      : action.support
                      ? "bg-cyan-500/10"
                      : "bg-blue-500/10"
                  }`}
                />

                <div className="relative">

                  {/* ICON */}

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      action.emergency
                        ? "border-red-500/20 bg-red-500/10 text-red-400"
                        : action.support
                        ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400"
                        : "border-blue-500/20 bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {action.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white">
                    {action.title}
                  </h3>

                  <p className="mt-2 min-h-20 text-sm leading-6 text-slate-500">
                    {action.description}
                  </p>

                  <div
                    className={`mt-5 flex items-center gap-2 text-sm font-semibold ${
                      action.emergency
                        ? "text-red-400"
                        : action.support
                        ? "text-cyan-400"
                        : "text-blue-400"
                    }`}
                  >
                    Open

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>

                  </div>

                </div>

              </Link>
            ))}

          </div>

        </section>

        {/* ==========================================
            AI HEALTH COMPANION
        ========================================== */}

        <section className="mt-10">

          <div className="mb-5">

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              AI Health Companion
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              Ask HealthCompanion AI
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Get general health information, understand medical
              terms, and prepare questions for your healthcare
              professional.
            </p>

          </div>
          <AIAssistant role="patient" />  
        </section>

        {/* ==========================================
            BOTTOM SECTIONS
        ========================================== */}

        <section className="mt-10 grid gap-5 lg:grid-cols-2">

          {/* ACCOUNT */}

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-xl shadow-black/20 backdrop-blur-xl">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">

                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
                </svg>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                  Account
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Manage Your Profile
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View your personal information and account details.
                </p>

              </div>

            </div>

            <Link
              to="/profile"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Profile

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>

            </Link>

          </div>

          {/* HEALTHCARE CTA */}

          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-600/10 p-7 shadow-xl shadow-blue-950/20">

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Health Companion
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                Need Healthcare Help?
              </h2>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Discover doctors, hospitals, appointments,
                SevaCare services, AI assistance, emergency
                support, and customer care from one connected
                platform.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/find-doctors"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Find Doctors
                </Link>

                <Link
                  to="/ai-health-companion"
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
                >
                  Open AI
                </Link>

                <Link
                  to="/customer-support"
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-400 transition hover:bg-cyan-500/20"
                >
                  Customer Support
                </Link>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default PatientDashboard;