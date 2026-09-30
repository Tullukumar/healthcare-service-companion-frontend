import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MEDICAL RECORDS
  // ==========================================

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/medical-records/my",
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
          data.message || "Unable to load medical records."
        );
      }

      setRecords(
        Array.isArray(data.records)
          ? data.records
          : []
      );
    } catch (err) {
      console.error(
        "Medical records error:",
        err
      );

      setError(
        err.message ||
          "Unable to load medical records."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD RECORDS
  // ==========================================

  useEffect(() => {
    // Start the state-updating request after the effect has completed.
    const request = Promise.resolve().then(fetchMedicalRecords);

    return () => {
      // Ignore any pending continuation after this page is unmounted.
      request.then(() => {}, () => {});
    };
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center">
            <p className="text-blue-400">
              Loading your medical records...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 sm:py-16 lg:px-8">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="pointer-events-none absolute -left-40 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Health Records
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                My Medical Records
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
                View your diagnosis, symptoms, medications,
                medical history, doctor notes, and follow-up
                information in one place.
              </p>
            </div>

            <Link
              to="/patient-dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              ← Dashboard
            </Link>

          </div>

        </section>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {!error && records.length === 0 && (
          <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-10 text-center shadow-xl">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">

              <svg
                width="30"
                height="30"
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

            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              No Medical Records Yet
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Your medical records will appear here after
              a doctor creates a record for you.
            </p>

          </section>
        )}

        {/* ==========================================
            MEDICAL RECORDS
        ========================================== */}

        {records.length > 0 && (
          <section className="mt-8 space-y-6">

            {records.map((record) => (

              <article
                key={record._id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 backdrop-blur-xl"
              >

                {/* RECORD HEADER */}

                <div className="border-b border-white/10 p-6 sm:p-7">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                        Medical Consultation
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-white">
                        {record.diagnosis ||
                          "Medical Consultation"}
                      </h2>

                    </div>

                    {record.createdAt && (
                      <div className="text-sm text-slate-500">
                        {new Date(
                          record.createdAt
                        ).toLocaleDateString()}
                      </div>
                    )}

                  </div>

                  {/* DOCTOR */}

                  {record.doctor && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">

                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Doctor
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {record.doctor.name ||
                          record.doctor.user?.name ||
                          "Doctor"}
                      </p>

                    </div>
                  )}

                </div>

                {/* RECORD DETAILS */}

                <div className="grid gap-5 p-6 sm:p-7 md:grid-cols-2">

                  {/* SYMPTOMS */}

                  <RecordItem
                    title="Symptoms"
                    value={record.symptoms}
                  />

                  {/* DIAGNOSIS */}

                  <RecordItem
                    title="Diagnosis"
                    value={record.diagnosis}
                  />

                  {/* ALLERGIES */}

                  <RecordItem
                    title="Allergies"
                    value={record.allergies}
                  />

                  {/* MEDICATIONS */}

                  <RecordItem
                    title="Medications"
                    value={record.medications}
                  />

                  {/* MEDICAL HISTORY */}

                  <RecordItem
                    title="Medical History"
                    value={record.medicalHistory}
                    full
                  />

                  {/* NOTES */}

                  <RecordItem
                    title="Doctor Notes"
                    value={record.notes}
                    full
                  />

                </div>

                {/* FOLLOW UP */}

                {record.followUpDate && (
                  <div className="border-t border-white/10 px-6 py-5 sm:px-7">

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">

                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                        Follow-up Date
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        {new Date(
                          record.followUpDate
                        ).toLocaleDateString()}
                      </p>

                    </div>

                  </div>
                )}

                {/* APPOINTMENT */}

                {record.appointment && (
                  <div className="border-t border-white/10 px-6 py-5 sm:px-7">

                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Related Appointment
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      {record.appointment.date || "Date"}
                      {" • "}
                      {record.appointment.time || "Time"}
                    </p>

                    {record.appointment.reason && (
                      <p className="mt-1 text-sm text-slate-500">
                        {record.appointment.reason}
                      </p>
                    )}

                  </div>
                )}

              </article>

            ))}

          </section>
        )}

      </div>

    </main>
  );
}

// ==========================================
// RECORD ITEM
// ==========================================

function RecordItem({
  title,
  value,
  full = false,
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/3 p-5 ${
        full ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">
        {value || "Not provided"}
      </p>
    </div>
  );
}

export default MedicalRecords;