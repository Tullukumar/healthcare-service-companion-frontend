import { useNavigate } from "react-router-dom";
import SearchSection from "../components/SearchSection";
import ServicesSection from "../components/ServicesSection";

function Icon({ name, size = 20 }) {
  const icons = {
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    shield: (
      <>
        <path d="M12 3 20 7v5c0 4.8-3.3 7.9-8 9-4.7-1.1-8-4.2-8-9V7l8-4Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    doctor: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
        <path d="M18 8v5M15.5 10.5h5" />
      </>
    ),
    emergency: (
      <>
        <path d="M12 3v18M3 12h18" />
        <rect x="4" y="4" width="16" height="16" rx="3" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();

  return (
    <main className="bg-slate-950 text-white">
      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute -left-48 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-20 sm:px-8 lg:px-12 lg:pb-28 lg:pt-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* LEFT */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Healthcare, connected
              </div>

              {/* Heading */}
              <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                Your Healthcare.
                <span className="block text-blue-400">
                  Connected.
                </span>
                <span className="block text-slate-300">
                  Simplified.
                </span>
              </h1>

              {/* Description */}
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-500 sm:text-lg">
                Find trusted doctors, discover hospitals, manage
                appointments, and get emergency assistance from one
                healthcare platform.
              </p>

              {/* Buttons */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/find-doctors")}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  Find a Doctor
                  <Icon name="arrow" size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/emergency")}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-6 text-sm font-bold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20"
                >
                  <Icon name="emergency" size={18} />
                  Emergency Assistance
                </button>
              </div>

              {/* Trust points */}
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-emerald-400">
                    <Icon name="check" size={16} />
                  </span>
                  Verified doctors
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-emerald-400">
                    <Icon name="check" size={16} />
                  </span>
                  Easy appointments
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="text-emerald-400">
                    <Icon name="check" size={16} />
                  </span>
                  Emergency support
                </div>
              </div>
            </div>

            {/* RIGHT DASHBOARD CARD */}
            <div className="relative">
              {/* Outer glow */}
              <div className="pointer-events-none absolute inset-10 rounded-full bg-blue-600/20 blur-3xl" />

              <div className="relative mx-auto max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-5">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
                      HealthCompanion
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Healthcare Overview
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <Icon name="shield" size={18} />
                  </div>
                </div>

                {/* Main card */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-600">
                        NEXT APPOINTMENT
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-white">
                        Your healthcare, organized
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      <Icon name="calendar" size={20} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-slate-950/70 p-4">
                      <div className="text-blue-400">
                        <Icon name="doctor" size={19} />
                      </div>

                      <p className="mt-3 text-xs text-slate-600">
                        DOCTORS
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        Find care
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-950/70 p-4">
                      <div className="text-red-400">
                        <Icon name="emergency" size={19} />
                      </div>

                      <p className="mt-3 text-xs text-slate-600">
                        EMERGENCY
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        24 / 7
                      </p>
                    </div>
                  </div>
                </div>

                {/* Activity */}
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">
                      Your healthcare journey
                    </p>

                    <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <JourneyItem
                      number="01"
                      title="Find your doctor"
                      description="Search by specialty and location."
                    />

                    <JourneyItem
                      number="02"
                      title="Book an appointment"
                      description="Choose a convenient consultation time."
                    />

                    <JourneyItem
                      number="03"
                      title="Manage your care"
                      description="Keep your healthcare journey organized."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH ================= */}
      <SearchSection />

      {/* ================= SERVICES ================= */}
      <ServicesSection />

      {/* ================= EMERGENCY CTA ================= */}
      <section className="relative overflow-hidden border-t border-white/10 bg-slate-950 px-6 py-20 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-red-600/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 sm:p-10 lg:p-12">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  Emergency support
                </div>

                <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Need urgent medical assistance?
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                  Quickly request emergency assistance and connect with
                  the available emergency services.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/emergency")}
                className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-500"
              >
                <Icon name="emergency" size={18} />
                Get Emergency Help
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function JourneyItem({
  number,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-xs font-bold text-blue-400">
        {number}
      </div>

      <div>
        <p className="text-sm font-bold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

export default Home;