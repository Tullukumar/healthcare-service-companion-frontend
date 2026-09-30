import { useEffect, useState } from "react";
import AppointmentCommunication from "../components/AppointmentCommunication";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login to view your appointments.");
          setLoading(false);
          return;
        }
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/appointments/my`,
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
            data.message || "Failed to load appointments."
          );
        }

        setAppointments(data.appointments || []);
      } catch (error) {
        console.error("Appointments error:", error);

        setError(
          error.message || "Unable to load appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusClasses = (status) => {
    switch (status) {
      case "confirmed":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "pending":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";

      case "cancelled":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "completed":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      default:
        return "border-white/10 bg-white/5 text-slate-400";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-400";

      case "pending":
        return "bg-amber-400";

      case "cancelled":
        return "bg-red-400";

      case "completed":
        return "bg-blue-400";

      default:
        return "bg-slate-500";
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Patient Portal
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Appointments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            View your scheduled consultations and keep track of
            your healthcare appointments.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400"
          >
            <span className="font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-5 text-sm font-medium text-slate-500">
              Loading your appointments...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && appointments.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
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
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              No appointments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You haven't booked any appointments yet.
              Find a doctor and schedule your first consultation.
            </p>
          </div>
        )}

        {/* Appointment Cards */}
        {!loading && !error && appointments.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-2">
            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-white/20"
              >
                {/* Doctor Header */}
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      {/* Doctor Image */}
                      {appointment.doctor?.profileImage ? (
                        <img
                          src={appointment.doctor.profileImage}
                          alt={
                            appointment.doctor.user?.name ||
                            "Doctor"
                          }
                          className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                          <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <circle
                              cx="12"
                              cy="7"
                              r="3.5"
                            />

                            <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />

                            <path d="M12 13v4M9.5 15h5" />
                          </svg>
                        </div>
                      )}

                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-white">
                          Dr.{" "}
                          {appointment.doctor?.user?.name ||
                            "Doctor"}
                        </h2>

                        <p className="mt-1 truncate text-sm font-medium text-blue-400">
                          {appointment.doctor?.specialization ||
                            "Specialist"}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
                        appointment.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                          appointment.status
                        )}`}
                      />

                      {appointment.status}
                    </span>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="p-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Date */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="16"
                            rx="3"
                          />

                          <path d="M16 3v4M8 3v4M3 10h18" />
                        </svg>

                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Date
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-white">
                        {appointment.date}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="8"
                          />

                          <path d="M12 8v5l3 2" />
                        </svg>

                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Time
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-white">
                        {appointment.time}
                      </p>
                    </div>

                    {/* Fee */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-base font-bold">
                          ₹
                        </span>

                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Consultation
                        </span>
                      </div>

                      <p className="mt-3 text-sm font-bold text-white">
                        ₹{appointment.doctor?.consultationFee || 0}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  {appointment.reason && (
                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                      <div className="flex items-center gap-2">
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="text-blue-400"
                        >
                          <path d="M5 4h14v16H5z" />
                          <path d="M8 8h8M8 12h8M8 16h5" />
                        </svg>

                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                          Reason for Visit
                        </p>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-300">
                        {appointment.reason}
                      </p>
                    </div>
                  )}

                  {/* Bottom */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                        Appointment ID
                      </p>

                      <p className="mt-1 max-w-48 truncate font-mono text-xs text-slate-500">
                        {appointment._id}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 transition group-hover:border-blue-500/20 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </div>
                  </div>

                  {/* Chat / Call / Video Call */}
                  <AppointmentCommunication
                    appointment={appointment}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Appointments;