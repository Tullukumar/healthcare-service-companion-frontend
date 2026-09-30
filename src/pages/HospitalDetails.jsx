import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Icon({ name, size = 22 }) {
  const props = {
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
      <svg {...props}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...props}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...props}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg {...props}>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 7h2" />
        <path d="M13 7h2" />
        <path d="M9 11h2" />
        <path d="M13 11h2" />
        <path d="M9 15h2" />
        <path d="M13 15h2" />
      </svg>
    );
  }

  return null;
}

function HospitalDetails() {
  const { id } = useParams();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);
        setError("");
const response = await fetch(
  `http://localhost:5000/api/hospitals/${id}`
);

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load hospital");
        }

        setHospital(data.hospital);
      } catch (err) {
        setError(err.message || "Failed to load hospital");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHospital();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-white/10" />

          <div className="mt-8 h-72 animate-pulse rounded-3xl bg-white/5" />
        </div>
      </main>
    );
  }

  if (error || !hospital) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
            <Icon name="building" size={28} />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold">
            Hospital not found
          </h1>

          <p className="mt-3 text-slate-400">
            {error || "We could not find this hospital."}
          </p>

          <Link
            to="/hospitals"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            Back to Hospitals
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-24 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">

        <Link
          to="/hospitals"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300"
        >
          <span className="rotate-180">
            <Icon name="arrow" size={18} />
          </span>
          Back to hospitals
        </Link>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="grid lg:grid-cols-3">

            <div className="p-7 sm:p-10 lg:col-span-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Healthcare Facility
              </div>

              <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">
                {hospital.name}
              </h1>

              <div className="mt-5 flex items-center gap-2 text-slate-400">
                <Icon name="location" size={19} />
                {hospital.city || "Location unavailable"}
              </div>

              <div className="mt-8 border-t border-white/10 pt-8">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Address
                </p>

                <p className="mt-3 text-lg leading-8 text-slate-200">
                  {hospital.address || "Address not available"}
                </p>
              </div>
            </div>

            <div className="border-t border-white/10 bg-slate-900/60 p-7 lg:border-l lg:border-t-0 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                <Icon name="building" size={27} />
              </div>

              <h2 className="mt-6 text-xl font-bold">
                Contact hospital
              </h2>

              <div className="mt-7 space-y-3">

                {hospital.phone && (
                  <a
                    href={`tel:${hospital.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold hover:border-cyan-400/30"
                  >
                    <Icon name="phone" size={19} />
                    <span className="break-all">
                      {hospital.phone}
                    </span>
                  </a>
                )}

                {hospital.email && (
                  <a
                    href={`mailto:${hospital.email}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold hover:border-cyan-400/30"
                  >
                    <Icon name="mail" size={19} />
                    <span className="break-all">
                      {hospital.email}
                    </span>
                  </a>
                )}

                {!hospital.phone && !hospital.email && (
                  <p className="rounded-xl bg-white/5 p-4 text-sm text-slate-500">
                    No contact information available.
                  </p>
                )}

              </div>
            </div>

          </div>
        </section>

        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                <Icon name="location" size={21} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Location
                </p>

                <p className="mt-1 font-semibold">
                  {hospital.city || "Not available"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Icon name="building" size={21} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Facility
                </p>

                <p className="mt-1 font-semibold">
                  Registered Hospital
                </p>
              </div>
            </div>
          </div>

        </div>

        <section className="mt-6 rounded-3xl border border-cyan-400/10 bg-cyan-400/5 p-7 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Need more healthcare options?
          </p>

          <h2 className="mt-2 text-2xl font-extrabold">
            Explore other hospitals
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Browse the hospitals available on HealthCompanion and explore
            their locations and contact information.
          </p>

          <Link
            to="/hospitals"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
          >
            View hospitals
            <Icon name="arrow" size={18} />
          </Link>
        </section>

      </div>
    </main>
  );
}

export default HospitalDetails;