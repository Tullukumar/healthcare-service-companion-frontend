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

  if (name === "heart") {
    return (
      <svg {...common}>
        <path d="M20.8 8.6c0 5.5-8.8 10.4-8.8 10.4S3.2 14.1 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z" />
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

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3 20 6v5c0 5-3.4 8.8-8 10-4.6-1.2-8-5-8-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "spark") {
    return (
      <svg {...common}>
        <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
        <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z" />
      </svg>
    );
  }

  return null;
}

function SevaCare() {
  const programs = [
    {
      icon: "heart",
      title: "Accessible care",
      description:
        "A future-focused healthcare experience designed to make essential services easier to discover.",
    },
    {
      icon: "users",
      title: "Community support",
      description:
        "Connect people with healthcare resources and services through one connected platform.",
    },
    {
      icon: "shield",
      title: "Trusted experience",
      description:
        "Keep healthcare interactions organized with a secure and simple digital experience.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-5 pb-20 pt-24 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-7 shadow-2xl sm:p-10 lg:p-14">

          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                <Icon name="spark" size={15} />
                SevaCare
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Healthcare with a human touch.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                SevaCare is our vision for making healthcare more connected,
                accessible, and easier to navigate for everyone.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
                >
                  Explore healthcare
                  <Icon name="arrow" size={18} />
                </Link>

                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-red-400/30 hover:bg-white/10"
                >
                  Emergency Assistance
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      SevaCare
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                      Connected care
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Icon name="heart" size={24} />
                  </div>
                </div>

                <div className="mt-8 space-y-3">

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" />

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Healthcare discovery
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Find doctors and hospitals
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Care coordination
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Keep your healthcare journey connected
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-violet-400" />

                      <div>
                        <p className="text-sm font-semibold text-white">
                          Community focused
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Designed around people and their needs
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* INTRO */}
        <section className="mt-12 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Our vision
          </p>

          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
            Technology should make healthcare easier to navigate.
          </h2>

          <p className="mt-4 text-base leading-8 text-slate-400">
            SevaCare brings together the different parts of a healthcare
            journey into a simpler digital experience. The goal is to reduce
            unnecessary friction while keeping people at the center.
          </p>
        </section>

        {/* PROGRAM CARDS */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">

          {programs.map((program) => (
            <div
              key={program.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:border-cyan-400/20 hover:bg-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Icon name={program.icon} size={23} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-white">
                {program.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                {program.description}
              </p>
            </div>
          ))}

        </section>

        {/* STATUS */}
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7 sm:p-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                Coming soon
              </div>

              <h2 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                SevaCare programs are being developed.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                The SevaCare section is currently focused on the vision and
                foundation of the service. Additional programs and community
                features can be connected here as the platform grows.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-cyan-400/30 hover:bg-white/10"
            >
              Back to Home
              <Icon name="arrow" size={18} />
            </Link>

          </div>
        </section>

      </div>
    </main>
  );
}

export default SevaCare;