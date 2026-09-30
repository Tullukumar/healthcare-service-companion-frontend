import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Appointment states
  const [showBooking, setShowBooking] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");

  // ==========================================
  // FETCH DOCTOR
  // ==========================================

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
  `http://localhost:5000/api/doctors/${id}`
);


        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load doctor."
          );
        }

        setDoctor(data.doctor);
      } catch (error) {
        console.error("Failed to fetch doctor:", error);
        setError(error.message || "Unable to load doctor.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  // ==========================================
  // BOOK APPOINTMENT
  // ==========================================

  const handleBookAppointment = async (event) => {
    event.preventDefault();

    setBookingMessage("");
    setBookingError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setBookingError(
        "Please login as a patient before booking an appointment."
      );
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      setBookingError(
        "Please select an appointment date and time."
      );
      return;
    }

    try {
      setBooking(true);
const response = await fetch(
  "http://localhost:5000/api/appointments",
  {      method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            doctor: doctor._id,
            date: appointmentDate,
            time: appointmentTime,
            reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to book appointment."
        );
      }

      setBookingMessage(
        "Appointment booked successfully!"
      );

      setAppointmentDate("");
      setAppointmentTime("");
      setReason("");
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setBooking(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto flex min-h-96 max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

            <p className="mt-5 text-sm text-slate-400">
              Loading doctor profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-xl font-bold text-red-400">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Unable to load doctor
            </h2>

            <p className="mt-2 text-sm text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/find-doctors")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Back to Doctors
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // DOCTOR NOT FOUND
  // ==========================================

  if (!doctor) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-2xl font-bold">
            Doctor not found
          </h2>

          <p className="mt-3 text-slate-500">
            The doctor profile you're looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/find-doctors")}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Back to Doctors
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-12 text-white sm:px-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/4 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 top-80 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">

        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate("/find-doctors")}
          className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-white"
        >
          <span>←</span>
          Back to Doctors
        </button>

        {/* ========================================== */}
        {/* DOCTOR HEADER */}
        {/* ========================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur-xl">

          <div className="p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              {/* Doctor */}
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Image */}
                {doctor.profileImage ? (
                  <img
                    src={doctor.profileImage}
                    alt={doctor.user?.name || "Doctor"}
                    className="h-28 w-28 shrink-0 rounded-3xl object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-blue-500/10 text-2xl font-bold text-blue-400 ring-1 ring-blue-500/20">
                    DR
                  </div>
                )}

                {/* Information */}
                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Dr. {doctor.user?.name || "Doctor"}
                    </h1>

                    {doctor.isVerified && (
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                        ✓ Verified
                      </span>
                    )}

                  </div>

                  <p className="mt-2 text-lg font-semibold text-blue-400">
                    {doctor.specialization}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {doctor.experience || 0}+ years of experience
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                      ⭐ 4.8 Rating
                    </span>

                    {doctor.city && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                        📍 {doctor.city}
                      </span>
                    )}

                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                      ₹{doctor.consultationFee || 0} Consultation
                    </span>

                  </div>

                </div>
              </div>

              {/* Booking button */}
              <div className="shrink-0">

                <button
                  type="button"
                  onClick={() => {
                    setShowBooking(true);
                    setBookingMessage("");
                    setBookingError("");
                  }}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 sm:w-auto"
                >
                  Book Appointment
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* ========================================== */}
        {/* BOOKING FORM */}
        {/* ========================================== */}

        {showBooking && (
          <section className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-xl sm:p-8">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Appointment
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white">
                  Book Appointment
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Schedule an appointment with Dr.{" "}
                  {doctor.user?.name || "Doctor"}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBooking(false)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* Success */}
            {bookingMessage && (
              <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                ✓ {bookingMessage}
              </div>
            )}

            {/* Error */}
            {bookingError && (
              <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-400">
                {bookingError}
              </div>
            )}

            <form
              onSubmit={handleBookAppointment}
              className="mt-7 space-y-5"
            >

              {/* Date + Time */}
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Appointment Date
                  </label>

                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(event) =>
                      setAppointmentDate(event.target.value)
                    }
                    min={new Date()
                      .toISOString()
                      .split("T")[0]}
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Appointment Time
                  </label>

                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(event) =>
                      setAppointmentTime(event.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Reason for Visit
                </label>

                <textarea
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Briefly describe your reason for consultation..."
                  rows="4"
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-blue-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={booking}
                className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking
                  ? "Booking Appointment..."
                  : "Confirm Appointment"}
              </button>

            </form>

          </section>
        )}

        {/* ========================================== */}
        {/* CONTENT */}
        {/* ========================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* About */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-2 sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Doctor Profile
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              About Doctor
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              {doctor.about ||
                "This doctor has not added an introduction yet."}
            </p>

            {/* Qualifications */}
            <div className="mt-8 border-t border-white/10 pt-7">

              <h3 className="text-lg font-semibold">
                Qualifications
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                {doctor.qualification || "Not provided"}
              </p>

            </div>

            {/* Hospital */}
            <div className="mt-8 border-t border-white/10 pt-7">

              <h3 className="text-lg font-semibold">
                Hospital / Clinic
              </h3>

              <p className="mt-3 text-sm text-slate-400">
                {doctor.hospital?.name || "Not provided"}
              </p>

            </div>

          </section>

          {/* Availability */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Schedule
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              Availability
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">

                <div>
                  <p className="text-sm font-medium text-white">
                    Today
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current availability
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    doctor.isAvailable
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {doctor.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                <p className="text-sm font-medium text-white">
                  Appointment
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Select a date and time above to request an
                  appointment with this doctor.
                </p>

              </div>

              <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-4">

                <p className="text-xs font-semibold text-blue-400">
                  Consultation Fee
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  ₹{doctor.consultationFee || 0}
                </p>

              </div>

            </div>

          </section>

        </div>

      </div>
    </main>
  );
}

export default DoctorProfile;