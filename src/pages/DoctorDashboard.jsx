import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AIAssistant from "../components/AIAssistant";

// ==========================================
// DEFAULT DOCTOR SCHEDULE
// ==========================================

const DEFAULT_SCHEDULE = [
  {
    day: "Monday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
  {
    day: "Tuesday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
  {
    day: "Wednesday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
  {
    day: "Thursday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
  {
    day: "Friday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
  {
    day: "Saturday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
  {
    day: "Sunday",
    isAvailable: false,
    startTime: "",
    endTime: "",
    slotDuration: 30,
  },
];

// ==========================================
// COMPONENT
// ==========================================

function DoctorDashboard() {
  // ==========================================
  // AI
  // ==========================================

  const openAI = () => {
    const aiSection =
      document.getElementById("healthcompanion-ai");

    if (aiSection) {
      aiSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // ==========================================
  // SCHEDULE STATE
  // ==========================================

  const [schedule, setSchedule] =
    useState(DEFAULT_SCHEDULE);

  const [scheduleLoading, setScheduleLoading] =
    useState(true);

  const [scheduleSaving, setScheduleSaving] =
    useState(false);

  const [scheduleError, setScheduleError] =
    useState("");

  const [scheduleMessage, setScheduleMessage] =
    useState("");

  // ==========================================
  // GET DOCTOR SCHEDULE
  // ==========================================

  const fetchSchedule = async () => {
    try {
      setScheduleLoading(true);
      setScheduleError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login as a doctor first."
        );
      }
const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/doctors/schedule`,
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
          data.message ||
            "Unable to load doctor schedule."
        );
      }

      const savedSchedule =
        Array.isArray(data.schedule)
          ? data.schedule
          : [];

      const mergedSchedule =
        DEFAULT_SCHEDULE.map(
          (defaultDay) => {
            const savedDay =
              savedSchedule.find(
                (item) =>
                  item.day === defaultDay.day
              );

            if (!savedDay) {
              return {
                ...defaultDay,
              };
            }

            return {
              day: defaultDay.day,

              isAvailable:
                savedDay.isAvailable === true,

              startTime:
                savedDay.startTime || "",

              endTime:
                savedDay.endTime || "",

              slotDuration:
                Number(
                  savedDay.slotDuration
                ) || 30,
            };
          }
        );

      setSchedule(mergedSchedule);
    } catch (error) {
      console.error(
        "Fetch doctor schedule error:",
        error
      );

      setScheduleError(
        error.message ||
          "Unable to load doctor schedule."
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  // ==========================================
  // LOAD SCHEDULE WHEN PAGE OPENS
  // ==========================================
useEffect(() => {
  const timer = setTimeout(() => {
    fetchSchedule();
  }, 0);

  return () => {
    clearTimeout(timer);
  };
}, []);

  // ==========================================
  // CHANGE DAY AVAILABILITY
  // ==========================================

  const handleAvailabilityChange = (
    index
  ) => {
    setSchedule((previousSchedule) =>
      previousSchedule.map(
        (daySchedule, currentIndex) => {
          if (currentIndex !== index) {
            return daySchedule;
          }

          const newAvailability =
            !daySchedule.isAvailable;

          return {
            ...daySchedule,

            isAvailable:
              newAvailability,

            startTime:
              newAvailability
                ? daySchedule.startTime
                : "",

            endTime:
              newAvailability
                ? daySchedule.endTime
                : "",
          };
        }
      )
    );

    setScheduleMessage("");
    setScheduleError("");
  };

  // ==========================================
  // CHANGE START TIME
  // ==========================================

  const handleStartTimeChange = (
    index,
    value
  ) => {
    setSchedule((previousSchedule) =>
      previousSchedule.map(
        (daySchedule, currentIndex) =>
          currentIndex === index
            ? {
                ...daySchedule,
                startTime: value,
              }
            : daySchedule
      )
    );

    setScheduleMessage("");
    setScheduleError("");
  };

  // ==========================================
  // CHANGE END TIME
  // ==========================================

  const handleEndTimeChange = (
    index,
    value
  ) => {
    setSchedule((previousSchedule) =>
      previousSchedule.map(
        (daySchedule, currentIndex) =>
          currentIndex === index
            ? {
                ...daySchedule,
                endTime: value,
              }
            : daySchedule
      )
    );

    setScheduleMessage("");
    setScheduleError("");
  };

  // ==========================================
  // CHANGE SLOT DURATION
  // ==========================================

  const handleSlotDurationChange = (
    index,
    value
  ) => {
    setSchedule((previousSchedule) =>
      previousSchedule.map(
        (daySchedule, currentIndex) =>
          currentIndex === index
            ? {
                ...daySchedule,
                slotDuration:
                  Number(value),
              }
            : daySchedule
      )
    );

    setScheduleMessage("");
    setScheduleError("");
  };

  // ==========================================
  // VALIDATE SCHEDULE
  // ==========================================

  const validateSchedule = () => {
    for (const day of schedule) {
      // ----------------------------------------
      // OFF DAY
      // ----------------------------------------

      if (!day.isAvailable) {
        continue;
      }

      // ----------------------------------------
      // TIME REQUIRED
      // ----------------------------------------

      if (
        !day.startTime ||
        !day.endTime
      ) {
        return `${day.day}: Please select both start and end time.`;
      }

      // ----------------------------------------
      // START MUST BE BEFORE END
      // ----------------------------------------

      if (
        day.startTime >= day.endTime
      ) {
        return `${day.day}: End time must be later than start time.`;
      }

      // ----------------------------------------
      // SLOT DURATION
      // ----------------------------------------

      if (
        ![15, 30, 45, 60].includes(
          Number(day.slotDuration)
        )
      ) {
        return `${day.day}: Please select a valid appointment duration.`;
      }
    }

    return "";
  };

  // ==========================================
  // SAVE SCHEDULE
  // ==========================================

  const handleSaveSchedule = async () => {
    try {
      setScheduleError("");
      setScheduleMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login as a doctor first."
        );
      }

      // ----------------------------------------
      // VALIDATION
      // ----------------------------------------

      const validationError =
        validateSchedule();

      if (validationError) {
        setScheduleError(
          validationError
        );

        return;
      }

      setScheduleSaving(true);

      // ----------------------------------------
      // SAVE TO BACKEND
      // ----------------------------------------
const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/doctors/schedule`,
  {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            schedule,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save doctor schedule."
        );
      }

      // ----------------------------------------
      // UPDATE LOCAL STATE
      // ----------------------------------------

      if (
        Array.isArray(data.schedule)
      ) {
        const savedSchedule =
          DEFAULT_SCHEDULE.map(
            (defaultDay) => {
              const savedDay =
                data.schedule.find(
                  (item) =>
                    item.day ===
                    defaultDay.day
                );

              if (!savedDay) {
                return {
                  ...defaultDay,
                };
              }

              return {
                day: defaultDay.day,

                isAvailable:
                  savedDay.isAvailable ===
                  true,

                startTime:
                  savedDay.startTime || "",

                endTime:
                  savedDay.endTime || "",

                slotDuration:
                  Number(
                    savedDay.slotDuration
                  ) || 30,
              };
            }
          );

        setSchedule(savedSchedule);
      }

      setScheduleMessage(
        data.message ||
          "Appointment schedule saved successfully."
      );
    } catch (error) {
      console.error(
        "Save doctor schedule error:",
        error
      );

      setScheduleError(
        error.message ||
          "Unable to save appointment schedule."
      );
    } finally {
      setScheduleSaving(false);
    }
  };

  // ==========================================
  // RETURN
  // ==========================================

  return (
  <main className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-cyan-400">
                Doctor Portal
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Doctor Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Manage your appointments,
                maintain your professional
                profile, set your consultation
                availability, and access
                HealthCompanion AI for general
                healthcare workflow guidance.
              </p>
            </div>

            <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-xs font-semibold text-emerald-400">
                Doctor Portal Active
              </span>
            </div>

          </div>
        </div>

        {/* ==========================================
            OVERVIEW CARDS
        ========================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* APPOINTMENTS */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Appointments
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Manage
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              View and manage patient
              appointments.
            </p>

          </div>

          {/* PROFILE */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Profile
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Doctor Setup
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Maintain your professional
              information.
            </p>

          </div>

          {/* AI */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AI Support
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              HealthCompanion
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              General healthcare workflow
              guidance.
            </p>

          </div>

          {/* PORTAL */}

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Portal
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Active
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Your doctor workspace is ready.
            </p>

          </div>

        </div>

        {/* ==========================================
            QUICK ACTIONS
        ========================================== */}

        <div className="mb-8">

          <div className="mb-4">

            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Quick Actions
            </p>

            <h2 className="mt-1 text-xl font-bold text-white">
              Manage Your Workspace
            </h2>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* APPOINTMENTS */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-cyan-400/20">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Appointments
              </p>

              <h3 className="mt-2 text-xl font-bold text-white">
                Manage Appointments
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View and manage your upcoming
                patient appointments.
              </p>

              <Link
                to="/doctor-appointments"
                className="mt-5 inline-flex rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                View Appointments
              </Link>

            </div>

            {/* DOCTOR PROFILE */}

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-blue-400/20">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Doctor Profile
              </p>

              <h3 className="mt-2 text-xl font-bold text-white">
                Doctor Setup
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage your professional
                information, specialization,
                and profile details.
              </p>

              <Link
                to="/doctor-setup"
                className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:border-blue-400/30 hover:bg-white/10"
              >
                Open Setup
              </Link>

            </div>

            {/* AI */}

            <button
              type="button"
              onClick={openAI}
              className="group rounded-2xl border border-white/10 bg-slate-900 p-5 text-left transition hover:-translate-y-1 hover:border-violet-400/30 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
            >

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                AI Support
              </p>

              <h3 className="mt-2 text-xl font-bold text-white">
                HealthCompanion AI
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Get structured general guidance
                for consultations and healthcare
                workflows.
              </p>

              <div className="mt-5 text-sm font-semibold text-violet-400 transition group-hover:text-violet-300">
                Open HealthCompanion AI →
              </div>

            </button>

          </div>

        </div>

        {/* ==========================================
            APPOINTMENT SCHEDULE
        ========================================== */}

        <section
          id="appointment-schedule"
          className="mb-10 scroll-mt-6"
        >

          <div className="mb-4">

            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              Appointment Schedule
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              Set Your Consultation Availability
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Choose the days and hours when
              you accept appointments. Patients
              will only be able to book slots
              inside your available working hours.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 sm:p-6">

            {/* LOADING */}

            {scheduleLoading ? (
              <div className="flex items-center justify-center py-12">

                <div className="flex items-center gap-3">

                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />

                  <p className="text-sm text-slate-400">
                    Loading your appointment
                    schedule...
                  </p>

                </div>

              </div>
            ) : (
              <>

                {/* INFORMATION */}

                <div className="mb-6 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">

                  <div className="flex gap-3">

                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                      📅
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-cyan-300">
                        How your schedule works
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        Set your working start and
                        end time for each day. Then
                        choose how long each
                        appointment should last.
                        Days marked OFF will not
                        receive appointments.
                      </p>

                    </div>

                  </div>

                </div>

                {/* DAYS */}

                <div className="space-y-4">

                  {schedule.map(
                    (daySchedule, index) => (
                      <div
                        key={daySchedule.day}
                        className={`rounded-2xl border p-4 transition ${
                          daySchedule.isAvailable
                            ? "border-cyan-400/20 bg-cyan-400/5"
                            : "border-white/5 bg-white/5"
                        }`}
                      >

                        {/* DAY HEADER */}

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div className="flex items-center gap-4">

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                                daySchedule.isAvailable
                                  ? "bg-cyan-400/10 text-cyan-400"
                                  : "bg-white/5 text-slate-500"
                              }`}
                            >
                              {daySchedule.day.slice(
                                0,
                                3
                              )}
                            </div>

                            <div>

                              <p className="font-bold text-white">
                                {daySchedule.day}
                              </p>

                              <p className="text-xs text-slate-500">
                                {daySchedule.isAvailable
                                  ? "Available for appointments"
                                  : "OFF — not accepting appointments"}
                              </p>

                            </div>

                            {/* TOGGLE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleAvailabilityChange(
                                  index
                                )
                              }
                              className={`relative ml-2 h-6 w-11 rounded-full transition ${
                                daySchedule.isAvailable
                                  ? "bg-cyan-500"
                                  : "bg-slate-700"
                              }`}
                              aria-label={`Toggle ${daySchedule.day} availability`}
                            >

                              <span
                                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                                  daySchedule.isAvailable
                                    ? "left-6"
                                    : "left-1"
                                }`}
                              />

                            </button>

                          </div>

                          {!daySchedule.isAvailable && (
                            <span className="w-fit rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                              OFF
                            </span>
                          )}

                        </div>

                        {/* TIME SETTINGS */}

                        {daySchedule.isAvailable && (
                          <div className="mt-5 grid gap-4 border-t border-white/5 pt-5 sm:grid-cols-3">

                            {/* START */}

                            <div>

                              <label
                                htmlFor={`start-${daySchedule.day}`}
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                              >
                                Start Time
                              </label>

                              <input
                                id={`start-${daySchedule.day}`}
                                type="time"
                                value={
                                  daySchedule.startTime
                                }
                                onChange={(event) =>
                                  handleStartTimeChange(
                                    index,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                              />

                            </div>

                            {/* END */}

                            <div>

                              <label
                                htmlFor={`end-${daySchedule.day}`}
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                              >
                                End Time
                              </label>

                              <input
                                id={`end-${daySchedule.day}`}
                                type="time"
                                value={
                                  daySchedule.endTime
                                }
                                onChange={(event) =>
                                  handleEndTimeChange(
                                    index,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                              />

                            </div>

                            {/* SLOT DURATION */}

                            <div>

                              <label
                                htmlFor={`duration-${daySchedule.day}`}
                                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500"
                              >
                                Appointment Duration
                              </label>

                              <select
                                id={`duration-${daySchedule.day}`}
                                value={
                                  daySchedule.slotDuration
                                }
                                onChange={(event) =>
                                  handleSlotDurationChange(
                                    index,
                                    event.target.value
                                  )
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                              >

                                <option value={15}>
                                  15 minutes
                                </option>

                                <option value={30}>
                                  30 minutes
                                </option>

                                <option value={45}>
                                  45 minutes
                                </option>

                                <option value={60}>
                                  60 minutes
                                </option>

                              </select>

                            </div>

                          </div>
                        )}

                      </div>
                    )
                  )}

                </div>

                {/* ERROR */}

                {scheduleError && (
                  <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3">

                    <p className="text-sm font-semibold text-red-400">
                      {scheduleError}
                    </p>

                  </div>
                )}

                {/* SUCCESS */}

                {scheduleMessage && (
                  <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">

                    <p className="text-sm font-semibold text-emerald-400">
                      {scheduleMessage}
                    </p>

                  </div>
                )}

                {/* SAVE */}

                <div className="mt-6 flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Ready to update your availability?
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Patients will see your
                      available appointment slots
                      based on this schedule.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    disabled={scheduleSaving}
                    className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {scheduleSaving ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />

                        Saving...
                      </>
                    ) : (
                      "Save Appointment Schedule"
                    )}

                  </button>

                </div>

              </>
            )}

          </div>

        </section>

        {/* ==========================================
            AI ASSISTANT
        ========================================== */}

        <section
          id="healthcompanion-ai"
          className="mt-10 scroll-mt-6"
        >

          <div className="mb-4">

            <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
              AI Support
            </p>

            <h2 className="mt-1 text-2xl font-bold text-white">
              HealthCompanion AI
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Use AI for general consultation
              preparation and healthcare
              workflow guidance.
            </p>

          </div>

          <AIAssistant role="doctor" />

        </section>

        {/* ==========================================
            MEDICAL DISCLAIMER
        ========================================== */}

        <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-5">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-300">
              ⚠
            </div>

            <div>

              <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Important
              </p>

              <p className="mt-2 text-xs leading-5 text-amber-300">
                HealthCompanion AI provides
                general informational guidance
                only. It does not replace
                professional medical judgment,
                diagnosis, treatment, or
                emergency medical services.
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}

export default DoctorDashboard;