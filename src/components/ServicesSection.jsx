import { useNavigate } from "react-router-dom";

function Icon({ name }) {
  const icons = {
    doctor: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
        <path d="M18 8v5M15.5 10.5h5" />
      </>
    ),

    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </>
    ),

    records: (
      <>
        <path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
        <path d="M8 12h8M8 16h6" />
      </>
    ),

    billing: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h8M8 11h8M8 15h4" />
        <path d="M16 17h.01" />
      </>
    ),

    online: (
      <>
        <path d="M4 5h16v11H4z" />
        <path d="M8 21h8M12 16v5" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),

    sevacare: (
      <>
        <path d="M20.8 8.8c0 5.1-8.8 10.2-8.8 10.2S3.2 13.9 3.2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" />
        <path d="M8.5 9.5h7M12 6v7" />
      </>
    ),
  };

  return (
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
      {icons[name]}
    </svg>
  );
}

function ServicesSection() {
  const navigate = useNavigate();

  const services = [
    {
      title: "Find Doctors",
      description:
        "Find doctors based on specialty, location, availability, and preferences.",
      icon: "doctor",
      path: "/find-doctors",
    },
    {
      title: "Book Appointments",
      description:
        "Check availability and book a convenient appointment with your doctor.",
      icon: "calendar",
      path: "/appointments",
    },
    {
      title: "Medical Records",
      description:
        "Keep prescriptions, reports, bills, and important medical documents organized.",
      icon: "records",
      path: "/profile",
    },
    {
      title: "Transparent Billing",
      description:
        "View consultation fees and understand your healthcare expenses clearly.",
      icon: "billing",
      path: "/appointments",
    },
    {
      title: "Consult Online",
      description:
        "Connect with healthcare professionals from wherever you are.",
      icon: "online",
      path: "/doctors",
    },
    {
      title: "SevaCare",
      description:
        "Access healthcare assistance and support through the SevaCare platform.",
      icon: "sevacare",
      path: "/sevacare",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white sm:px-8 lg:px-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Healthcare made simple
            <span className="h-2 w-2 rounded-full bg-blue-400" />
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything You Need
            <span className="block text-blue-400">
              In One Place
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            From finding a doctor to managing your healthcare journey,
            HealthCompanion connects the essential services you need.
          </p>
        </div>

        {/* Services */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <button
              key={service.title}
              type="button"
              onClick={() => navigate(service.path)}
              className="group text-left"
            >
              <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-blue-500/5">
                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 transition duration-300 group-hover:border-blue-400/30 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                  <Icon name={service.icon} />
                </div>

                {/* Content */}
                <div className="mt-7">
                  <h3 className="text-xl font-bold text-white transition group-hover:text-blue-400">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {service.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-slate-600 transition group-hover:text-blue-400">
                  Explore
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;