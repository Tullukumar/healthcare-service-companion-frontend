import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "hospital") {
    return (
      <svg {...common}>
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 7h6" />
        <path d="M12 4v6" />
        <path d="M9 10h6" />
        <path d="M8 21v-5h3v5" />
        <path d="M13 16h3v5" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2Z" />
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

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
    );
  }

  if (name === "bed") {
    return (
      <svg {...common}>
        <path d="M3 18v-7" />
        <path d="M21 18v-7" />
        <path d="M3 14h18" />
        <path d="M5 14V9a2 2 0 0 1 2-2h4a3 3 0 0 1 3 3v4" />
        <path d="M3 18h18" />
      </svg>
    );
  }

  return null;
}

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError("");
const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/hospitals`
);


        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch hospitals"
          );
        }

        setHospitals(
          Array.isArray(data)
            ? data
            : data.hospitals || []
        );
      } catch (err) {
        console.error(err);
        setError(
          err.message || "Unable to load hospitals"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const cities = [
    ...new Set(
      hospitals
        .map((hospital) => hospital.city)
        .filter(Boolean)
    ),
  ];

  const filteredHospitals = hospitals.filter((hospital) => {
    const searchText = search.toLowerCase().trim();

    const hospitalName =
      hospital.name ||
      hospital.hospitalName ||
      "";

    const hospitalCity =
      hospital.city ||
      hospital.location ||
      "";

    const hospitalAddress =
      hospital.address || "";

    const matchesSearch =
      !searchText ||
      hospitalName.toLowerCase().includes(searchText) ||
      hospitalCity.toLowerCase().includes(searchText) ||
      hospitalAddress.toLowerCase().includes(searchText);

    const matchesCity =
      !city ||
      hospitalCity === city;

    return matchesSearch && matchesCity;
  });

  const getHospitalName = (hospital) => {
    return (
      hospital.name ||
      hospital.hospitalName ||
      "Hospital"
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-cyan-500/5" />

        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-10 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Healthcare facilities
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find hospitals you
              <span className="block text-cyan-400">
                can rely on.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover hospitals and healthcare facilities,
              explore their details and find the care you
              need.
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="relative z-10 mx-auto -mt-2 max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="relative md:col-span-8">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Icon name="search" size={19} />
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search hospital or location..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/10"
              />
            </div>

            <div className="md:col-span-4">
              <select
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-300 outline-none transition focus:border-cyan-400/40"
              >
                <option
                  value=""
                  className="bg-slate-900"
                >
                  All Locations
                </option>

                {cities.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-slate-900"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Listing */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-cyan-400">
              Healthcare network
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Hospitals
            </h2>
          </div>

          {!loading && !error && (
            <p className="text-sm text-slate-500">
              {filteredHospitals.length} hospital
              {filteredHospitals.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-3xl border border-white/5 bg-white/5 p-6"
              >
                <div className="h-16 w-16 rounded-2xl bg-white/10" />

                <div className="mt-5 h-5 w-44 rounded bg-white/10" />

                <div className="mt-3 h-4 w-28 rounded bg-white/10" />

                <div className="mt-6 h-4 w-full rounded bg-white/5" />

                <div className="mt-2 h-4 w-3/4 rounded bg-white/5" />

                <div className="mt-8 h-11 w-full rounded-xl bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <p className="text-sm font-semibold text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          filteredHospitals.length === 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/5 px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400">
                <Icon name="hospital" size={28} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-white">
                No hospitals found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try changing your search or selecting
                another location.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCity("");
                }}
                className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* Hospital Cards */}
        {!loading &&
          !error &&
          filteredHospitals.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHospitals.map((hospital) => {
                const name = getHospitalName(hospital);

                return (
                  <article
                    key={hospital._id}
                    className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-950/20"
                  >
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition group-hover:bg-cyan-500/20" />

                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        {hospital.image ||
                        hospital.profileImage ? (
                          <img
                            src={
                              hospital.image ||
                              hospital.profileImage
                            }
                            alt={name}
                            className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/10">
                            <Icon
                              name="hospital"
                              size={30}
                            />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="break-all text-lg font-bold text-white">
                            {name}
                          </h3>

                          <p className="mt-1 text-sm text-cyan-400">
                            Healthcare Facility
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="mt-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 text-slate-600">
                            <Icon
                              name="location"
                              size={18}
                            />
                          </span>

                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">
                              Location
                            </p>

                            <p className="mt-1 text-sm leading-6 text-slate-400">
                              {hospital.address ||
                                hospital.city ||
                                "Location not specified"}
                            </p>
                          </div>
                        </div>

                        {hospital.city && (
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">
                              <Icon
                                name="hospital"
                                size={18}
                              />
                            </span>

                            <span className="text-sm text-slate-400">
                              {hospital.city}
                            </span>
                          </div>
                        )}

                        {hospital.phone && (
                          <div className="flex items-center gap-3">
                            <span className="text-slate-600">
                              <Icon
                                name="phone"
                                size={18}
                              />
                            </span>

                            <a
                              href={`tel:${hospital.phone}`}
                              className="text-sm text-slate-400 transition hover:text-cyan-400"
                            >
                              {hospital.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Facilities */}
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                          <div className="flex items-center gap-2 text-cyan-400">
                            <Icon
                              name="bed"
                              size={17}
                            />

                            <span className="text-xs font-bold">
                              Hospital
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                          <div className="flex items-center gap-2 text-blue-400">
                            <Icon
                              name="hospital"
                              size={17}
                              />
                            <span className="text-xs font-bold">
                              Doctors
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Button */}
                      <div className="mt-6 border-t border-white/5 pt-5">
                        <Link
                          to={`/hospitals/${hospital._id}`}
                          className="group/button flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                        >
                          View Hospital

                          <span className="transition-transform group-hover/button:translate-x-1">
                            <Icon
                              name="arrow"
                              size={16}
                            />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}

export default Hospitals;