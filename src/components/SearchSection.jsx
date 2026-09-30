import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Icon({ name }) {
  const icons = {
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),

    location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    specialty: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
        <path d="M18 5v6M15 8h6" />
      </>
    ),

    arrow: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg
      width="20"
      height="20"
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

function SearchSection() {
  const navigate = useNavigate();

  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (specialty.trim()) {
      params.set("specialty", specialty.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    const query = params.toString();

    navigate(query ? `/find-doctors?${query}` : "/find-doctors");
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-20 text-white sm:px-8 lg:px-12">
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Find the right care
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find a Doctor
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Search healthcare professionals by specialty and location.
          </p>
        </div>

        {/* Search Card */}
        <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-7">
          <form
            onSubmit={handleSearch}
            className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
          >
            {/* Specialty */}
            <div>
              <label
                htmlFor="specialty"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Specialty
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                  <Icon name="specialty" />
                </span>

                <input
                  id="specialty"
                  type="text"
                  value={specialty}
                  onChange={(event) =>
                    setSpecialty(event.target.value)
                  }
                  placeholder="e.g. Cardiologist"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-950"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500"
              >
                Location
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                  <Icon name="location" />
                </span>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Noida"
                  className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-950"
                />
              </div>
            </div>

            {/* Button */}
            <div className="flex items-end">
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-500 lg:w-auto"
              >
                <Icon name="search" />
                Search
              </button>
            </div>
          </form>

          {/* Quick link */}
          <button
            type="button"
            onClick={() => navigate("/find-doctors")}
            className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-400"
          >
            Browse all doctors
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default SearchSection;