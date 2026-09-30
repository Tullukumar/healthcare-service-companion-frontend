import { Link } from "react-router-dom";

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="6" width="13" height="12" rx="2" />
        <path d="m16 10 5-3v10l-5-3z" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3 20 6v5c0 5-3.4 8.8-8 10-4.6-1.2-8-5-8-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 5.5a3 3 0 0 1 0 5.8M18 14c1.8.7 3 2.4 3 4.5" />
      </svg>
    );
  }

  return null;
}

function Doctors() {
  const specialties = [
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Orthopedic",
    "Pediatrician",
  ];

  const features = [
    {
      icon: "search",
      title: "Find the right doctor",
      description:
        "Search doctors by specialty and discover healthcare professionals that match your needs.",
    },
    {
      icon: "calendar",
      title: "Book appointments",
      description:
        "Choose an available time and request your appointment directly through the platform.",
    },
    {
      icon: "video",
      title: "Online consultations",
      description:
        "Connect with doctors remotely when an in-person visit is not necessary.",
    },
    {
      icon: "shield",
      title: "Trusted healthcare",
      description:
        "Doctor profiles and platform access are designed around a secure healthcare experience.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-20 pt-24 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl sm:p-10 lg:p-14">

          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative max-w-4xl">

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Healthcare Network
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find a doctor who fits your healthcare needs.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover doctors across specialties, explore their profiles,
              and book appointments through one connected healthcare platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/find-doctors"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Find Doctors
                <Icon name="arrow" size={18} />
              </Link>

              <Link
                to="/appointments"
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
              >
                My Appointments
              </Link>

            </div>
          </div>
        </section>

        {/* SPECIALTIES */}
        <section className="mt-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Explore Specialties
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                Start with what you need
              </h2>
            </div>

            <Link
              to="/find-doctors"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-cyan-300"
            >
              View all doctors
              <Icon name="arrow" size={17} />
            </Link>

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {specialties.map((specialty) => (
              <Link
                key={specialty}
                to="/find-doctors"
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-cyan-400/5"
              >
                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="font-bold text-white group-hover:text-cyan-300">
                      {specialty}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Explore available doctors
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-slate-400 group-hover:bg-cyan-400/10 group-hover:text-cyan-300">
                    <Icon name="arrow" size={18} />
                  </div>

                </div>
              </Link>
            ))}

          </div>
        </section>

        {/* FEATURES */}
        <section className="mt-14">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              One Connected Experience
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-white">
              Healthcare discovery, simplified.
            </h2>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">

            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/20 hover:bg-white/10 sm:p-7"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                  <Icon name={feature.icon} size={23} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-400">
                  {feature.description}
                </p>

              </div>
            ))}

          </div>
        </section>

        {/* CTA */}
        <section className="mt-8 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-6 sm:p-10">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="flex items-center gap-2 text-cyan-300">
                <Icon name="users" size={20} />

                <span className="text-xs font-bold uppercase tracking-widest">
                  Your Care Network
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Ready to find your doctor?
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-400">
                Search the available doctor network and take the next step
                toward your appointment.
              </p>

            </div>

            <Link
              to="/find-doctors"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Search Doctors
              <Icon name="arrow" size={18} />
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default Doctors;