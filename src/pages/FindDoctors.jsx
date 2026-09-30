import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function FindDoctors() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get search values from URL
  const specialty = searchParams.get("specialty") || "";
  const location = searchParams.get("location") || "";
  const time = searchParams.get("time") || "Any time";

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
  "http://localhost:5000/api/doctors"
);


        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load doctors."
          );
        }

        setDoctors(data.doctors || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setError(error.message || "Unable to load doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors
  const filteredDoctors = doctors.filter((doctor) => {
    const doctorSpecialization =
      doctor.specialization?.toLowerCase() || "";

    const doctorCity =
      doctor.city?.toLowerCase() || "";

    const searchSpecialty =
      specialty.toLowerCase();

    const searchLocation =
      location.toLowerCase();

    const matchesSpecialty =
      !searchSpecialty ||
      doctorSpecialization.includes(searchSpecialty);

    const matchesLocation =
      !searchLocation ||
      doctorCity.includes(searchLocation);

    return matchesSpecialty && matchesLocation;
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white sm:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Healthcare Services
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Find a Doctor
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Find verified doctors based on their specialty,
            location, and healthcare needs.
          </p>
        </div>

        {/* Active Search */}
        {(specialty || location || time !== "Any time") && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-3">

              <span className="text-sm font-medium text-slate-400">
                Search:
              </span>

              {specialty && (
                <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                  {specialty}
                </span>
              )}

              {location && (
                <span className="rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                  📍 {location}
                </span>
              )}

              {time !== "Any time" && (
                <span className="rounded-full bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-400">
                  {time}
                </span>
              )}

              <button
                type="button"
                onClick={() => navigate("/find-doctors")}
                className="ml-auto rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

              <p className="mt-4 text-sm text-slate-400">
                Loading doctors...
              </p>
            </div>
          </div>
        )}

        {/* No doctors at all */}
        {!loading && !error && doctors.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
              <svg
  className="h-7 w-7 text-blue-400"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
>
  <circle cx="12" cy="12" r="9" />
  <path d="M12 8v8M8 12h8" />
</svg>
            </div>

            <h2 className="mt-6 text-xl font-bold text-white">
              No doctors available
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no verified doctors available
              on the platform.
            </p>
          </div>
        )}

        {/* No matching doctors */}
        {!loading &&
          !error &&
          doctors.length > 0 &&
          filteredDoctors.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-2xl text-blue-400">
                <svg
  className="h-7 w-7 text-blue-400"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
>
  <circle cx="12" cy="12" r="9" />
  <path d="M9.5 9a2.5 2.5 0 1 1 4.4 1.6c-.9 1-1.9 1.2-1.9 2.6" />
  <path d="M12 16.5h.01" />
</svg>
              </div>

              <h2 className="mt-6 text-xl font-bold text-white">
                No matching doctors
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                We couldn't find a doctor matching your selected
                specialty or location.
              </p>

              <button
                type="button"
                onClick={() => navigate("/find-doctors")}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                View All Doctors
              </button>
            </div>
          )}

        {/* Doctor count */}
        {!loading &&
          !error &&
          filteredDoctors.length > 0 && (
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-300">
                  {filteredDoctors.length}
                </span>{" "}
                doctor
                {filteredDoctors.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

        {/* Doctors */}
        {!loading &&
          !error &&
          filteredDoctors.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <article
                  key={doctor._id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/10"
                >
                  {/* Doctor header */}
                  <div className="flex items-center gap-4">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={doctor.user?.name || "Doctor"}
                        className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-xl font-bold text-blue-400 ring-1 ring-blue-500/20">
                        DR
                      </div>
                    )}

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-white">
                        {doctor.user?.name || "Doctor"}
                      </h2>

                      <p className="mt-1 truncate text-sm font-medium text-blue-400">
                        {doctor.specialization || "Medical Specialist"}
                      </p>
                    </div>
                  </div>

                  {/* Doctor information */}
                  <div className="mt-6 space-y-3 text-sm">

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">
                        Qualification
                      </span>

                      <span className="text-right text-slate-300">
                        {doctor.qualification || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">
                        Experience
                      </span>

                      <span className="text-slate-300">
                        {doctor.experience || 0} years
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">
                        Hospital
                      </span>

                      <span className="max-w-44 truncate text-right text-slate-300">
                        {doctor.hospital?.name ||
                          "Hospital not provided"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-500">
                        Location
                      </span>

                      <span className="text-right text-slate-300">
                        {doctor.city || "Not provided"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-slate-500">
                        Consultation
                      </span>

                      <span className="font-semibold text-white">
                        ₹{doctor.consultationFee || 0}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                      ✓ Verified
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/doctors/${doctor._id}`)
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
                    >
                      View Profile
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
      </div>
    </main>
  );
}

export default FindDoctors;