import { useEffect, useState } from "react";
import AppointmentCommunication from "../components/AppointmentCommunication";
import AIAssistant from "../components/AIAssistant";

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // ==========================================
  // MEDICAL RECORD
  // =========================================

const [selectedAppointmentForRecord, setSelectedAppointmentForRecord] =
  useState(null);

const [patientRecords, setPatientRecords] = useState([]);
const [recordsLoading, setRecordsLoading] = useState(false);
const [recordsError, setRecordsError] = useState("");
const [showPatientRecords, setShowPatientRecords] = useState(false);
const [selectedPatientName, setSelectedPatientName] = useState("");



const [showMedicalRecordForm, setShowMedicalRecordForm] =
  useState(false);

const [medicalRecordForm, setMedicalRecordForm] = useState({
  symptoms: "",
  diagnosis: "",
  allergies: "",
  medications: "",
  medicalHistory: "",
  notes: "",
  followUpDate: "",
});

const [medicalRecordLoading, setMedicalRecordLoading] =
  useState(false);

const [medicalRecordError, setMedicalRecordError] =
  useState("");

const [medicalRecordSuccess, setMedicalRecordSuccess] =
  useState(false);

  const token = localStorage.getItem("token");

  // ==========================================
// CREATE MEDICAL RECORD
// ==========================================
const handleCreateMedicalRecord = async (e) => {
  e.preventDefault();

  try {
    setMedicalRecordLoading(true);
    setMedicalRecordError("");
    setMedicalRecordSuccess("");

    if (!token) {
      throw new Error("Please login again.");
    }

    if (!selectedAppointmentForRecord?._id) {
      throw new Error("Appointment information is missing.");
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/medical-records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          patient:
            selectedAppointmentForRecord.patient?._id ||
            selectedAppointmentForRecord.patient,

          appointment:
            selectedAppointmentForRecord._id,

          symptoms:
            medicalRecordForm.symptoms,

          diagnosis:
            medicalRecordForm.diagnosis,

          allergies:
            medicalRecordForm.allergies,

          medications:
            medicalRecordForm.medications,

          medicalHistory:
            medicalRecordForm.medicalHistory,

          notes:
            medicalRecordForm.notes,

          followUpDate:
            medicalRecordForm.followUpDate || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Unable to create medical record."
      );
    }

    setMedicalRecordSuccess(
      "Medical record created successfully."
    );

    setMedicalRecordForm({
      symptoms: "",
      diagnosis: "",
      allergies: "",
      medications: "",
      medicalHistory: "",
      notes: "",
      followUpDate: "",
    });

  } catch (error) {
    console.error(
      "Create medical record error:",
      error
    );

    setMedicalRecordError(
      error.message ||
        "Unable to create medical record."
    );
  } finally {
    setMedicalRecordLoading(false);
  }
};

// ==========================================
// VIEW PATIENT MEDICAL RECORDS
// ==========================================

const handleViewPatientRecords = async (appointment) => {
  try {
    setRecordsLoading(true);
    setRecordsError("");
    setPatientRecords([]);
    setSelectedPatientName(
      appointment.patient?.name || "Patient"
    );
    setShowPatientRecords(true);

    if (!token) {
      throw new Error("Please login again.");
    }

    const patientId =
      appointment.patient?._id ||
      appointment.patient;

    if (!patientId) {
      throw new Error(
        "Patient information is missing."
      );
    }

    const response = await fetch(
     `${import.meta.env.VITE_API_URL}/api/medical-records/patient/${patientId}`,
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
          "Unable to fetch medical records."
      );
    }

    setPatientRecords(data.records || []);
  } catch (error) {
    console.error(
      "Fetch patient medical records error:",
      error
    );

    setRecordsError(
      error.message ||
        "Unable to fetch medical records."
    );
  } finally {
    setRecordsLoading(false);
  }
};



  // ==========================================
  // LOAD APPOINTMENTS
  // ==========================================

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("Please login to view your appointments.");
          return;
        }

        const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/appointments/doctor`,
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
        console.error("Fetch appointments error:", error);

        setError(
          error.message || "Unable to load appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  // ==========================================
  // APPROVE / REJECT / COMPLETE
  // ==========================================

  const handleAppointmentAction = async (
    appointmentId,
    action
  ) => {
    try {
      setActionLoading(`${appointmentId}-${action}`);
      setError("");



    const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/appointments/${appointmentId}/${action}`,
  {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${action} appointment.`
        );
      }

      // Update appointment locally
      let newStatus = "";

      if (action === "approve") {
        newStatus = "confirmed";
      }

      if (action === "reject") {
        newStatus = "cancelled";
      }

      if (action === "complete") {
        newStatus = "completed";
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? {
                ...appointment,
                status: newStatus,
              }
            : appointment
        )
      );
    } catch (error) {
      console.error(
        `${action} appointment error:`,
        error
      );

      setError(
        error.message ||
          `Unable to ${action} appointment.`
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // STATUS CLASSES
  // ==========================================

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "border-amber-500/20 bg-amber-500/10 text-amber-400";

      case "confirmed":
        return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

      case "cancelled":
        return "border-red-500/20 bg-red-500/10 text-red-400";

      case "completed":
        return "border-blue-500/20 bg-blue-500/10 text-blue-400";

      default:
        return "border-white/10 bg-white/5 text-slate-400";
    }
  };

  // ==========================================
  // STATUS DOT
  // ==========================================

  const getStatusDot = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-400";

      case "confirmed":
        return "bg-emerald-400";

      case "cancelled":
        return "bg-red-400";

      case "completed":
        return "bg-blue-400";

      default:
        return "bg-slate-500";
    }
  };

  // ==========================================
  // ACTION BUTTON LOADING
  // ==========================================

  const isActionLoading = (appointmentId, action) => {
    return (
      actionLoading === `${appointmentId}-${action}`
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8">

      {/* Background Glow */}

      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Background Grid */}

      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-10">

          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Doctor Dashboard
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Appointments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Review appointment requests from your patients
            and manage their consultation status.
          </p>

        </div>

        {/* ==========================================
            ERROR
        ========================================== */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400"
          >
            <span className="font-bold">!</span>

            <span>{error}</span>
          </div>
        )}

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-12 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-blue-500" />

            <p className="mt-5 text-sm font-medium text-slate-500">
              Loading appointments...
            </p>

          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading &&
          !error &&
          appointments.length === 0 && (
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
                No appointments
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                You currently have no appointment requests
                from your patients.
              </p>

            </div>
          )}

        {/* ==========================================
            APPOINTMENTS
        ========================================== */}

        {!loading && appointments.length > 0 && (
          <div className="space-y-5">

            {appointments.map((appointment) => (
              <article
                key={appointment._id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-200 hover:border-white/20"
              >

                {/* ======================================
                    PATIENT HEADER
                ====================================== */}

                <div className="border-b border-white/10 p-6 sm:p-7">

                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* Patient */}

                    <div className="flex items-center gap-4">

                      {/* Avatar */}

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-xl font-bold text-blue-400">
                        {appointment.patient?.name
                          ? appointment.patient.name
                              .charAt(0)
                              .toUpperCase()
                          : "P"}
                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                          Patient
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-white">
                          {appointment.patient?.name ||
                            "Patient"}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          {appointment.patient?.email ||
                            "No email"}
                        </p>

                        {appointment.patient?.phone && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">

                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                            >
                              <path d="M6.5 3.5h3l1.5 4-2 1.5c1 2.2 2.8 4 5 5l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.6 18.5 5.5 13.4 5.5 7.5c0-1.1.9-2 2-2Z" />
                            </svg>

                            {appointment.patient.phone}

                          </div>
                        )}

                      </div>

                    </div>

                    {/* Status */}

                    <span
                      className={`flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${getStatusClasses(
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

                {/* ======================================
                    APPOINTMENT INFORMATION
                ====================================== */}

                <div className="p-6 sm:p-7">

                  <div className="grid gap-4 sm:grid-cols-3">

                    {/* DATE */}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

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

                      <p className="mt-3 font-bold text-white">
                        {appointment.date}
                      </p>

                    </div>

                    {/* TIME */}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

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

                      <p className="mt-3 font-bold text-white">
                        {appointment.time}
                      </p>

                    </div>

                    {/* REASON */}

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">

                      <div className="flex items-center gap-2 text-slate-500">

                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M5 4h14v16H5z" />

                          <path d="M8 8h8M8 12h8M8 16h5" />
                        </svg>

                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Reason
                        </span>

                      </div>

                      <p className="mt-3 line-clamp-2 font-semibold text-white">
                        {appointment.reason ||
                          "Not provided"}
                      </p>

                    </div>

                  </div>

                  {/* ======================================
                      ACTIONS
                  ====================================== */}

                  {/* PENDING */}

                  {appointment.status === "pending" && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">

                      {/* APPROVE */}

                      <button
                        type="button"
                        disabled={
                          actionLoading !== ""
                        }
                        onClick={() =>
                          handleAppointmentAction(
                            appointment._id,
                            "approve"
                          )
                        }
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {isActionLoading(
                          appointment._id,
                          "approve"
                        ) ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>

                            Approve Appointment
                          </>
                        )}

                      </button>

                      {/* REJECT */}

                      <button
                        type="button"
                        disabled={
                          actionLoading !== ""
                        }
                        onClick={() =>
                          handleAppointmentAction(
                            appointment._id,
                            "reject"
                          )
                        }
                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 text-sm font-bold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {isActionLoading(
                          appointment._id,
                          "reject"
                        ) ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                d="M6 6l12 12M18 6 6 18"
                                strokeLinecap="round"
                              />
                            </svg>

                            Reject Appointment
                          </>
                        )}

                      </button>

                    </div>
                  )}

                  {/* CONFIRMED */}

                  {appointment.status === "confirmed" && (
                    <div className="mt-6 border-t border-white/10 pt-6">

                      <button
                        type="button"
                        disabled={
                          actionLoading !== ""
                        }
                        onClick={() =>
                          handleAppointmentAction(
                            appointment._id,
                            "complete"
                          )
                        }
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-52"
                      >

                        {isActionLoading(
                          appointment._id,
                          "complete"
                        ) ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Completing...
                          </>
                        ) : (
                          <>
                            <svg
                              width="17"
                              height="17"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>

                            Mark as Completed
                          </>
                        )}

                      </button>

                      <p className="mt-3 text-xs text-slate-600">
                        Mark this appointment as completed
                        after the consultation has finished.
                      </p>

                    </div>
                  )}

                  {/* COMPLETED */}

{appointment.status === "completed" && (
  <div className="mt-6 border-t border-white/10 pt-6">

    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      {/* COMPLETED STATUS */}

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m5 12 4 4L19 6" />
          </svg>

        </div>

        <div>
          <p className="text-sm font-bold text-blue-400">
            Consultation Completed
          </p>

          <p className="text-xs text-slate-600">
            This appointment has been successfully completed.
          </p>
        </div>

      </div>

      {/* CREATE MEDICAL RECORD */}

      <button
        type="button"
        onClick={() => {
          setSelectedAppointmentForRecord(appointment);
          setShowMedicalRecordForm(true);
        }}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/10 transition hover:bg-emerald-500"
      >

        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
          <path d="M14 3v4h4" />
          <path d="M8 11h8" />
          <path d="M8 15h8" />
          <path d="M8 19h5" />
        </svg>

        Create Medical Record

      </button>

    </div>

  </div>
)}

                  {/* CANCELLED */}

                  {appointment.status === "cancelled" && (
                    <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-6">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">

                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            d="M6 6l12 12M18 6 6 18"
                            strokeLinecap="round"
                          />
                        </svg>

                      </div>

                      <div>
                        <p className="text-sm font-bold text-red-400">
                          Appointment Cancelled
                        </p>

                        <p className="text-xs text-slate-600">
                          This appointment request was
                          rejected.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* ======================================
                      VIEW PATIENT MEDICAL RECORDS
                    ====================================== */}

{appointment.status !== "cancelled" && (
  <div className="mt-6 border-t border-white/10 pt-6">

    <button
      type="button"
      onClick={() =>
        handleViewPatientRecords(appointment)
      }
      disabled={recordsLoading}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {recordsLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
          Loading Records...
        </>
      ) : (
        <>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 3h9l3 3v15H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            <path d="M14 3v4h4" />
            <path d="M8 11h8" />
            <path d="M8 15h8" />
          </svg>

          View Medical Records
        </>
      )}
    </button>

  </div>
)}


                  {/* ======================================
                      COMMUNICATION
                  ====================================== */}

                  <AppointmentCommunication
                    appointment={appointment}
                  />

                </div>

              </article>
            ))}

          </div>
        )}


        {/* ==========================================
    PATIENT MEDICAL RECORDS
========================================== */}

{showPatientRecords && (
  <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">

    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
          Medical Records
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          {selectedPatientName}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Previous medical records for this patient.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowPatientRecords(false);
          setPatientRecords([]);
          setRecordsError("");
          setSelectedPatientName("");
        }}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
      >
        Close
      </button>

    </div>

    {/* ERROR */}

    {recordsError && (
      <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
        {recordsError}
      </div>
    )}

    {/* LOADING */}

    {recordsLoading && (
      <div className="flex items-center justify-center py-12">

        <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />

      </div>
    )}

    {/* NO RECORDS */}

    {!recordsLoading &&
      !recordsError &&
      patientRecords.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">

          <p className="text-sm font-semibold text-slate-300">
            No medical records found
          </p>

          <p className="mt-2 text-xs text-slate-500">
            This patient does not have any previous medical records.
          </p>

        </div>
      )}

    {/* RECORDS */}

    {!recordsLoading &&
      patientRecords.length > 0 && (
        <div className="space-y-5">

          {patientRecords.map((record) => (
            <div
              key={record._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >

              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <h3 className="text-lg font-bold text-white">
                  Medical Record
                </h3>

                <span className="text-xs text-slate-500">
                  {record.createdAt
                    ? new Date(
                        record.createdAt
                      ).toLocaleDateString()
                    : "Date unavailable"}
                </span>

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Symptoms
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {record.symptoms || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Diagnosis
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {record.diagnosis || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Allergies
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {record.allergies || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Medications
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {record.medications || "Not provided"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Medical History
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                    {record.medicalHistory || "Not provided"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Doctor Notes
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">
                    {record.notes || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Follow-up Date
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {record.followUpDate
                      ? new Date(
                          record.followUpDate
                        ).toLocaleDateString()
                      : "No follow-up scheduled"}
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>
      )}

  </div>
)}

        {/* ==========================================
              MEDICAL RECORD FORM
            ========================================== */}

{showMedicalRecordForm &&
  selectedAppointmentForRecord && (
    <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Medical Record
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Create Medical Record
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Add medical information for the completed consultation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowMedicalRecordForm(false);
            setSelectedAppointmentForRecord(null);
            setMedicalRecordError("");
            setMedicalRecordSuccess("");
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>

      </div>

      {/* SUCCESS */}

      {medicalRecordSuccess && (
        <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
          {medicalRecordSuccess}
        </div>
      )}

      {/* ERROR */}

      {medicalRecordError && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {medicalRecordError}
        </div>
      )}

      <form
        onSubmit={handleCreateMedicalRecord}
        className="space-y-6"
      >

        {/* SYMPTOMS */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Symptoms
          </label>

          <textarea
            value={medicalRecordForm.symptoms}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                symptoms: e.target.value,
              }))
            }
            rows="3"
            placeholder="Enter patient's symptoms..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        {/* DIAGNOSIS */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Diagnosis
          </label>

          <textarea
            value={medicalRecordForm.diagnosis}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                diagnosis: e.target.value,
              }))
            }
            rows="3"
            placeholder="Enter diagnosis..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        {/* ALLERGIES */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Allergies
          </label>

          <textarea
            value={medicalRecordForm.allergies}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                allergies: e.target.value,
              }))
            }
            rows="2"
            placeholder="Enter known allergies..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        {/* MEDICATIONS */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Medications
          </label>

          <textarea
            value={medicalRecordForm.medications}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                medications: e.target.value,
              }))
            }
            rows="3"
            placeholder="Enter prescribed medications..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        {/* MEDICAL HISTORY */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Medical History
          </label>

          <textarea
            value={medicalRecordForm.medicalHistory}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                medicalHistory: e.target.value,
              }))
            }
            rows="3"
            placeholder="Enter relevant medical history..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        {/* DOCTOR NOTES */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Doctor Notes
          </label>

          <textarea
            value={medicalRecordForm.notes}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                notes: e.target.value,
              }))
            }
            rows="4"
            placeholder="Enter consultation notes..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/50"
          />
        </div>

        {/* FOLLOW-UP DATE */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            Follow-up Date
          </label>

          <input
            type="date"
            value={medicalRecordForm.followUpDate}
            onChange={(e) =>
              setMedicalRecordForm((current) => ({
                ...current,
                followUpDate: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* SAVE */}

        <button
          type="submit"
          disabled={medicalRecordLoading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {medicalRecordLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving Medical Record...
            </>
          ) : (
            "Save Medical Record"
          )}
        </button>

      </form>

    </div>
  )}
{/* ==========================================
    CREATE MEDICAL RECORD FORM
========================================== */}

{showMedicalRecordForm &&
  selectedAppointmentForRecord && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-white">
              Create Medical Record
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Patient:{" "}
              {selectedAppointmentForRecord.patient?.name ||
                "Patient"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowMedicalRecordForm(false);
              setMedicalRecordError("");
              setMedicalRecordSuccess("");
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>

        </div>

        {/* ERROR */}

        {medicalRecordError && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {medicalRecordError}
          </div>
        )}

        {/* SUCCESS */}

        {medicalRecordSuccess && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {medicalRecordSuccess}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleCreateMedicalRecord}
          className="space-y-5"
        >

          {/* SYMPTOMS */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Symptoms
            </label>

            <textarea
              value={medicalRecordForm.symptoms}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  symptoms: e.target.value,
                }))
              }
              rows="3"
              placeholder="Enter patient symptoms..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* DIAGNOSIS */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Diagnosis
            </label>

            <textarea
              value={medicalRecordForm.diagnosis}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  diagnosis: e.target.value,
                }))
              }
              rows="3"
              placeholder="Enter diagnosis..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* ALLERGIES */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Allergies
            </label>

            <textarea
              value={medicalRecordForm.allergies}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  allergies: e.target.value,
                }))
              }
              rows="2"
              placeholder="Enter known allergies..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* MEDICATIONS */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Medications
            </label>

            <textarea
              value={medicalRecordForm.medications}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  medications: e.target.value,
                }))
              }
              rows="3"
              placeholder="Enter prescribed medications..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* MEDICAL HISTORY */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Medical History
            </label>

            <textarea
              value={medicalRecordForm.medicalHistory}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  medicalHistory: e.target.value,
                }))
              }
              rows="3"
              placeholder="Enter relevant medical history..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* NOTES */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Doctor Notes
            </label>

            <textarea
              value={medicalRecordForm.notes}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  notes: e.target.value,
                }))
              }
              rows="4"
              placeholder="Enter additional doctor notes..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* FOLLOW UP */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Follow-up Date
            </label>

            <input
              type="date"
              value={medicalRecordForm.followUpDate}
              onChange={(e) =>
                setMedicalRecordForm((current) => ({
                  ...current,
                  followUpDate: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-emerald-500"
            />
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => {
                setShowMedicalRecordForm(false);
                setMedicalRecordError("");
                setMedicalRecordSuccess("");
              }}
              className="h-11 rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-slate-300 transition hover:bg-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={medicalRecordLoading}
              className="h-11 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {medicalRecordLoading
                ? "Saving..."
                : "Save Medical Record"}
            </button>

          </div>

        </form>

      </div>

    </div>
  )}



        {/* ==========================================
            DOCTOR AI ASSISTANT
        ========================================== */}

        <div className="mt-10">
          <AIAssistant role="doctor" />
        </div>

      </div>

    </main>
  );
}

export default DoctorAppointments;