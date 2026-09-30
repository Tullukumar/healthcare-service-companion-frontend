import { useCallback, useEffect, useState } from "react";

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

  const paths = {
    hospital: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V5h14v16" />
        <path d="M9 5V3h6v2" />
        <path d="M9 9h6" />
        <path d="M12 6v6" />
        <path d="M8 15h2M14 15h2M8 18h2M14 18h2" />
      </>
    ),
    doctor: (
      <>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
        <path d="M18 8v5M15.5 10.5h5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3.5 20c.6-3.6 2.5-5.5 5.5-5.5s4.9 1.9 5.5 5.5" />
        <path d="M16 5.5a3 3 0 0 1 0 5.9M16.5 14.8c2.1.4 3.4 2 4 5.2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    map: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    phone: (
      <>
        <path d="M6.5 3.5 9 3l2 5-2.2 1.5a15 15 0 0 0 5.2 5.2l1.5-2.2 5 2 .5 2.5c.2 1.2-.8 2.3-2 2.3C11.4 19.3 4.7 12.6 4.7 4.9c0-1.2 1.1-2.2 2.3-2Z" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}


const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Change this if your backend route for admin appointments is different
const ADMIN_APPOINTMENTS_PATH = "/appointments/admin";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);

  // Appointments
  const [, setAppointments] = useState([]);
  const [, setAppointmentsLoading] = useState(false);
  const [, setAppointmentsError] = useState("");

  // General
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectingDoctor, setRejectingDoctor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Seva care
  const [sevaRequests, setSevaRequests] = useState([]);
  const [sevaLoading, setSevaLoading] = useState(false);
  const [selectedSevaRequest, setSelectedSevaRequest] = useState(null);
  const [sevaStatusFilter, setSevaStatusFilter] = useState("");
  const [sevaTypeFilter, setSevaTypeFilter] = useState("");
  const [sevaUrgencyFilter, setSevaUrgencyFilter] = useState("");
  const [sevaNote, setSevaNote] = useState("");

  // Fetch admin appointments
  const fetchAdminAppointments = useCallback(async (signal) => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login again.");

      const response = await fetch(`${API_BASE_URL}${ADMIN_APPOINTMENTS_PATH}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load appointments.");
      }

      setAppointments(Array.isArray(data.appointments) ? data.appointments : []);
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("Admin appointments error:", err);
      setAppointmentsError(err.message || "Unable to load appointments.");
    } finally {
      if (!signal?.aborted) setAppointmentsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchAdminAppointments(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchAdminAppointments]);

  useEffect(() => {
    let mounted = true;

    const loadAdminData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login as an admin first.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [dashboardResponse, doctorsResponse, pendingResponse] = await Promise.all([
          fetch("http://localhost:5000/api/admin/dashboard", { headers }),
          fetch("http://localhost:5000/api/admin/doctors", { headers }),
          fetch("http://localhost:5000/api/admin/doctors/pending", { headers }),
        ]);

        const dashboardData = await dashboardResponse.json();
        const doctorsData = await doctorsResponse.json();
        const pendingData = await pendingResponse.json();

        let initialSevaRequests = [];

        try {
          const sevaResponse = await fetch("http://localhost:5000/api/admin/seva/requests", { headers });
          const sevaData = await sevaResponse.json();

          if (sevaResponse.ok) {
            initialSevaRequests = Array.isArray(sevaData.requests) ? sevaData.requests : [];
          } else {
            console.warn("SevaCare could not be loaded:", sevaData.message || "Unknown error");
          }
        } catch (sevaError) {
          console.warn("SevaCare request error:", sevaError.message);
        }

        if (!dashboardResponse.ok) {
          throw new Error(dashboardData.message || "Unable to load dashboard.");
        }

        if (!doctorsResponse.ok) {
          throw new Error(doctorsData.message || "Unable to load doctors.");
        }

        if (!pendingResponse.ok) {
          throw new Error(pendingData.message || "Unable to load pending doctors.");
        }

        if (mounted) {
          setDashboard(dashboardData);
          setDoctors(doctorsData.doctors || []);
          setPendingDoctors(pendingData.doctors || []);
          setSevaRequests(initialSevaRequests);
        }
      } catch (err) {
        console.error("Admin dashboard error:", err);

        if (mounted) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAdminData();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login as an admin first."
        );
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        dashboardResponse,
        doctorsResponse,
        pendingResponse,
      ] = await Promise.all([
    fetch(
  "http://localhost:5000/api/admin/dashboard",
  { headers }
),
fetch(
  "http://localhost:5000/api/admin/doctors",
  { headers }
),
fetch(
  "http://localhost:5000/api/admin/doctors/pending",
  { headers }
),
      ]);

      const dashboardData =
        await dashboardResponse.json();

      const doctorsData =
        await doctorsResponse.json();

      const pendingData =
        await pendingResponse.json();

      let refreshedSevaRequests = [];
try {
 const sevaResponse = await fetch(
  "http://localhost:5000/api/admin/seva/requests",
  { headers }
);

        const sevaData =
          await sevaResponse.json();

        if (sevaResponse.ok) {
          refreshedSevaRequests =
            Array.isArray(
              sevaData.requests
            )
              ? sevaData.requests
              : [];
        }
      } catch (sevaError) {
        console.warn(
          "Refresh SevaCare error:",
          sevaError.message
        );
      }

      if (!dashboardResponse.ok) {
        throw new Error(
          dashboardData.message ||
            "Unable to load dashboard."
        );
      }

      if (!doctorsResponse.ok) {
        throw new Error(
          doctorsData.message ||
            "Unable to load doctors."
        );
      }

      if (!pendingResponse.ok) {
        throw new Error(
          pendingData.message ||
            "Unable to load pending doctors."
        );
      }

      setDashboard(dashboardData);

      setDoctors(
        doctorsData.doctors || []
      );

      setPendingDoctors(
        pendingData.doctors || []
      );

      setSevaRequests(
        refreshedSevaRequests
      );
    } catch (err) {
      console.error(
        "Refresh error:",
        err
      );

      setError(
        err.message ||
          "Unable to refresh dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const approveDoctor = async (doctorId) => {
    try {
      setActionLoading(doctorId);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }
const response = await fetch(
  `http://localhost:5000/api/admin/doctors/${doctorId}/verify`,
  {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to approve doctor."
        );
      }

      setSuccess(
        "Doctor approved successfully."
      );

      setSelectedDoctor(null);

      await refreshDashboard();
    } catch (err) {
      console.error(
        "Approve doctor error:",
        err
      );

      setError(
        err.message ||
          "Unable to approve doctor."
      );
    } finally {
      setActionLoading("");
    }
  };

  const openRejectModal = (doctor) => {
    setRejectingDoctor(doctor);

    setRejectionReason("");

    setError("");
  };

  const rejectDoctor = async () => {
    if (!rejectingDoctor) return;

    if (!rejectionReason.trim()) {
      setError(
        "Please enter a rejection reason."
      );

      return;
    }

    try {
      setActionLoading(
        rejectingDoctor._id
      );

      setError("");

      setSuccess("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Please login again."
        );
      }
const response = await fetch(
  `http://localhost:5000/api/admin/doctors/${rejectingDoctor._id}/reject`,
  {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            rejectionReason:
              rejectionReason.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reject doctor."
        );
      }

      setSuccess(
        "Doctor rejected successfully."
      );

      setRejectingDoctor(null);

      setSelectedDoctor(null);

      setRejectionReason("");

      await refreshDashboard();
    } catch (err) {
      console.error(
        "Reject doctor error:",
        err
      );

      setError(
        err.message ||
          "Unable to reject doctor."
      );
    } finally {
      setActionLoading("");
    }
  };




  // ==========================================
  // SEVA CARE HELPERS
  // ==========================================

  const fetchSevaRequests = async () => {
    try {
      setSevaLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const params = new URLSearchParams();

      if (sevaStatusFilter) {
        params.set("status", sevaStatusFilter);
      }

      if (sevaTypeFilter) {
        params.set("requestType", sevaTypeFilter);
      }

      if (sevaUrgencyFilter) {
        params.set("urgency", sevaUrgencyFilter);
      }

      const query = params.toString();

     const response = await fetch(
  `http://localhost:5000/api/admin/seva/requests${
    query ? `?${query}` : ""
  }`,
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
          data.message || "Unable to load SevaCare requests."
        );
      }

      setSevaRequests(
        Array.isArray(data.requests) ? data.requests : []
      );
    } catch (err) {
      console.error("Fetch SevaCare requests error:", err);
      setError(err.message || "Unable to load SevaCare requests.");
    } finally {
      setSevaLoading(false);
    }
  };

  const updateSevaStatus = async (requestId, status) => {
    try {
      setActionLoading(`seva-${requestId}`);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const response = await fetch(
  `http://localhost:5000/api/admin/seva/requests/${requestId}/status`,
  {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            adminNotes: sevaNote.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update SevaCare status."
        );
      }

      setSuccess(
        data.message || "SevaCare request status updated successfully."
      );
      setSevaNote("");
      setSelectedSevaRequest(data.request || null);

      await fetchSevaRequests();
    } catch (err) {
      console.error("Update SevaCare status error:", err);
      setError(err.message || "Unable to update SevaCare status.");
    } finally {
      setActionLoading("");
    }
  };

  const updateSevaDonation = async (requestId, receivedAmount) => {
    try {
      setActionLoading(`donation-${requestId}`);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login again.");
      }

      const amount = Number(receivedAmount);

      if (Number.isNaN(amount) || amount < 0) {
        throw new Error("Please enter a valid donated amount.");
      }

     const response = await fetch(
  `http://localhost:5000/api/admin/seva/requests/${requestId}/donation`,
  {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receivedAmount: amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update donated amount."
        );
      }

      setSuccess(
        data.message || "Donated treatment amount updated successfully."
      );
      setSelectedSevaRequest(data.request || null);

      await fetchSevaRequests();
    } catch (err) {
      console.error("Update SevaCare donation error:", err);
      setError(err.message || "Unable to update donated amount.");
    } finally {
      setActionLoading("");
    }
  };

  const sevaTypeLabel = (type) => {
    const labels = {
      FREE_TREATMENT: "Free Treatment",
      FINANCIAL_ASSISTANCE: "Financial Assistance",
      MEDICINE: "Medicine",
      MEDICAL_EQUIPMENT: "Medical Equipment",
      BLOOD: "Blood Support",
    };

    return labels[type] || type || "SevaCare Support";
  };

  const sevaStatusStyles = {
    PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    APPROVED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    REJECTED: "border-red-500/20 bg-red-500/10 text-red-400",
    IN_PROGRESS: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    COMPLETED: "border-violet-500/20 bg-violet-500/10 text-violet-400",
    CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  };

  const sevaPendingCount = sevaRequests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const sevaApprovedCount = sevaRequests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const sevaInProgressCount = sevaRequests.filter(
    (request) => request.status === "IN_PROGRESS"
  ).length;

  const sevaCompletedCount = sevaRequests.filter(
    (request) => request.status === "COMPLETED"
  ).length;

  const sevaFinancialRequests = sevaRequests.filter(
    (request) => request.requestType === "FINANCIAL_ASSISTANCE"
  );

  const totalSevaRequired = sevaFinancialRequests.reduce(
    (total, request) => total + Number(request.requiredAmount || 0),
    0
  );

  const totalSevaReceived = sevaFinancialRequests.reduce(
    (total, request) => total + Number(request.receivedAmount || 0),
    0
  );

  const totalSevaSupportGap = Math.max(
    0,
    totalSevaRequired - totalSevaReceived
  );

  if (loading && !dashboard) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-400">
              Loading admin dashboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const stats = dashboard?.stats || dashboard?.statistics || {};
  const hospital = dashboard?.hospital || {};

  const doctorStats =
    typeof stats.doctors === "object" ? stats.doctors : {};

  const appointmentStats =
    typeof stats.appointments === "object" ? stats.appointments : {};

  const totalDoctors =
    stats.totalDoctors ??
    doctorStats.total ??
    doctors.length;

  const pendingCount =
    stats.pendingDoctors ??
    doctorStats.pending ??
    pendingDoctors.length;

  const approvedCount =
    stats.approvedDoctors ??
    doctorStats.approved ??
    doctors.filter((doctor) => doctor.status === "approved").length;

  const rejectedCount =
    stats.rejectedDoctors ??
    doctorStats.rejected ??
    doctors.filter((doctor) => doctor.status === "rejected").length;

  const patientsCount =
    stats.totalPatients ??
    (typeof stats.patients === "number"
      ? stats.patients
      : stats.patients?.total) ??
    stats.patientsServed ??
    0;

  const totalAppointments =
    stats.totalAppointments ??
    (typeof stats.appointments === "number"
      ? stats.appointments
      : appointmentStats.total) ??
    0;

  const completedAppointments =
    stats.completedAppointments ??
    appointmentStats.completed ??
    0;

  const pendingAppointments =
    stats.pendingAppointments ??
    appointmentStats.pending ??
    0;

  const statusStyles = {
    approved: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    rejected: "border-red-500/20 bg-red-500/10 text-red-400",
    pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-48 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-48 top-96 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Icon name="hospital" size={22} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                  HealthCompanion
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
              Manage doctors, patients, appointments and hospital activity
              from one central workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshDashboard}
            disabled={loading}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-bold text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={loading ? "animate-spin" : ""}>
              <Icon name="refresh" size={17} />
            </span>
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </header>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-semibold text-emerald-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
              <Icon name="check" size={16} />
            </span>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-400">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15">
              <Icon name="close" size={16} />
            </span>
            {error}
          </div>
        )}

        <section className="mb-7 overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-400">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Hospital / Clinic
              </div>

              <h2 className="mt-3 text-2xl font-bold text-white">
                {hospital.name || "Hospital / Clinic"}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                {hospital.city && (
                  <span className="flex items-center gap-2">
                    <Icon name="map" size={16} />
                    {hospital.city}
                  </span>
                )}

                {hospital.address && (
                  <span className="flex items-center gap-2">
                    <Icon name="hospital" size={16} />
                    {hospital.address}
                  </span>
                )}

                {hospital.phone && (
                  <span className="flex items-center gap-2">
                    <Icon name="phone" size={16} />
                    {hospital.phone}
                  </span>
                )}
              </div>
            </div>

            <div className="w-fit rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                System Status
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                Active
              </div>
            </div>
          </div>
        </section>

        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Doctors",
              value: totalDoctors,
              icon: "doctor",
              accent: "blue",
            },
            {
              label: "Pending Doctors",
              value: pendingCount,
              icon: "briefcase",
              accent: "amber",
            },
            {
              label: "Patients",
              value: patientsCount,
              icon: "users",
              accent: "emerald",
            },
            {
              label: "Appointments",
              value: totalAppointments,
              icon: "calendar",
              accent: "violet",
            },
          ].map((item) => {
            const accentMap = {
              blue: "border-blue-500/20 bg-blue-500/10 text-blue-400",
              amber: "border-amber-500/20 bg-amber-500/10 text-amber-400",
              emerald:
                "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
              violet:
                "border-violet-500/20 bg-violet-500/10 text-violet-400",
            };

            return (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-3 text-3xl font-bold tracking-tight text-white">
                      {item.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${accentMap[item.accent]}`}
                  >
                    <Icon name={item.icon} size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Approved",
              value: approvedCount,
              style: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
            },
            {
              label: "Pending Review",
              value: pendingCount,
              style: "border-amber-500/20 bg-amber-500/5 text-amber-400",
            },
            {
              label: "Rejected",
              value: rejectedCount,
              style: "border-red-500/20 bg-red-500/5 text-red-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border p-5 ${item.style}`}
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-400">
                Doctor Management
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Pending Doctors
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review professional profiles before approval.
              </p>
            </div>

            <span className="w-fit rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400">
              {pendingDoctors.length} pending
            </span>
          </div>

          {pendingDoctors.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Icon name="check" size={25} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">
                No pending doctors
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                There are no doctor profiles waiting for approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingDoctors.map((doctor) => {
                const name = doctor.user?.name || "Doctor";

                return (
                  <div
                    key={doctor._id}
                    className="rounded-3xl border border-white/10 bg-slate-900/75 p-5 shadow-xl shadow-black/10 backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        {doctor.profileImage ? (
                          <img
                            src={doctor.profileImage}
                            alt={name}
                            className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                            <Icon name="doctor" size={27} />
                          </div>
                        )}

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-white">
                              {name}
                            </h3>
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400">
                              Pending
                            </span>
                          </div>

                          <p className="mt-1 font-semibold text-blue-400">
                            {doctor.specialization ||
                              "Specialization not provided"}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            {doctor.qualification ||
                              "Qualification not provided"}
                          </p>

                          <p className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                            <Icon name="hospital" size={14} />
                            {doctor.hospital?.name || "Hospital"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDoctor(doctor)}
                          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-white"
                        >
                          <Icon name="eye" size={17} />
                          View
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === doctor._id}
                          onClick={() => approveDoctor(doctor._id)}
                          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon name="check" size={17} />
                          {actionLoading === doctor._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading === doctor._id}
                          onClick={() => openRejectModal(doctor)}
                          className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon name="close" size={17} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-400">
              Directory
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              All Doctors
            </h2>
          </div>

          {doctors.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-10 text-center text-sm text-slate-500">
              No doctors found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 shadow-xl shadow-black/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      {[
                        "Doctor",
                        "Specialization",
                        "Experience",
                        "Fee",
                        "Status",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className={`px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 ${
                            heading === "Action" ? "text-right" : ""
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {doctors.map((doctor) => {
                      const status = doctor.status || "pending";

                      return (
                        <tr
                          key={doctor._id}
                          className="border-b border-white/5 transition hover:bg-white/5"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {doctor.profileImage ? (
                                <img
                                  src={doctor.profileImage}
                                  alt={doctor.user?.name || "Doctor"}
                                  className="h-11 w-11 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                  <Icon name="doctor" size={19} />
                                </div>
                              )}

                              <div>
                                <p className="font-semibold text-white">
                                  {doctor.user?.name || "Doctor"}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-600">
                                  {doctor.user?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {doctor.specialization || "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {doctor.experience ?? 0} years
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-slate-300">
                            ₹{doctor.consultationFee ?? 0}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                                statusStyles[status] ||
                                statusStyles.pending
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedDoctor(doctor)}
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ========================================== */}
        {/* SEVA CARE MANAGEMENT */}
        {/* ========================================== */}

        <section className="mb-10">
          <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-emerald-400">
                SevaCare
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                Community Healthcare Support
              </h2>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                Review free treatment, donated treatment, financial assistance,
                medicine, medical equipment and blood-support requests.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSevaRequests}
              disabled={sevaLoading}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className={sevaLoading ? "animate-spin" : ""}>
                <Icon name="refresh" size={16} />
              </span>
              {sevaLoading ? "Loading..." : "Refresh SevaCare"}
            </button>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total Requests", sevaRequests.length, "blue"],
              ["Pending", sevaPendingCount, "amber"],
              ["Approved", sevaApprovedCount, "emerald"],
              ["In Progress", sevaInProgressCount, "violet"],
              ["Completed", sevaCompletedCount, "cyan"],
            ].map(([label, value, accent]) => {
              const styles = {
                blue: "border-blue-500/20 bg-blue-500/5 text-blue-400",
                amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
                emerald:
                  "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
                violet:
                  "border-violet-500/20 bg-violet-500/5 text-violet-400",
                cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400",
              };

              return (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 ${styles[accent]}`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.12em]">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mb-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-400">
                Requested Financial Support
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                ₹{totalSevaRequired.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-400">
                Donated / Received
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                ₹{totalSevaReceived.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-400">
                Remaining Support Gap
              </p>
              <p className="mt-2 text-2xl font-bold text-white">
                ₹{totalSevaSupportGap.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-3">
            <select
              value={sevaStatusFilter}
              onChange={(event) => setSevaStatusFilter(event.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm font-semibold text-slate-300 outline-none focus:border-emerald-500/40"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={sevaTypeFilter}
              onChange={(event) => setSevaTypeFilter(event.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm font-semibold text-slate-300 outline-none focus:border-emerald-500/40"
            >
              <option value="">All Support Types</option>
              <option value="FREE_TREATMENT">Free Treatment</option>
              <option value="FINANCIAL_ASSISTANCE">
                Financial Assistance
              </option>
              <option value="MEDICINE">Medicine</option>
              <option value="MEDICAL_EQUIPMENT">Medical Equipment</option>
              <option value="BLOOD">Blood Support</option>
            </select>

            <div className="flex gap-2">
              <select
                value={sevaUrgencyFilter}
                onChange={(event) => setSevaUrgencyFilter(event.target.value)}
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm font-semibold text-slate-300 outline-none focus:border-emerald-500/40"
              >
                <option value="">All Urgency</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="EMERGENCY">Emergency</option>
              </select>

              <button
                type="button"
                onClick={fetchSevaRequests}
                disabled={sevaLoading}
                className="rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Apply
              </button>
            </div>
          </div>

          {sevaRequests.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                <Icon name="hospital" size={25} />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">
                No SevaCare requests
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                No requests match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/75 shadow-xl shadow-black/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-190">
                  <thead className="border-b border-white/10 bg-white/5">
                    <tr>
                      {[
                        "Patient",
                        "Support",
                        "Urgency",
                        "Amount",
                        "Status",
                        "Hospital",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sevaRequests.map((request) => {
                      const required = Number(request.requiredAmount || 0);
                      const received = Number(request.receivedAmount || 0);
                      const gap = Math.max(0, required - received);

                      return (
                        <tr
                          key={request._id}
                          className="border-b border-white/5 transition hover:bg-white/5"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-white">
                              {request.patient?.name || "Patient"}
                            </p>
                            <p className="mt-1 text-xs text-slate-600">
                              {request.patient?.email || ""}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-emerald-400">
                              {sevaTypeLabel(request.requestType)}
                            </p>
                            <p className="mt-1 max-w-65 truncate text-xs text-slate-500">
                              {request.title || "SevaCare request"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                                request.urgency === "EMERGENCY"
                                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                                  : request.urgency === "HIGH"
                                  ? "border-orange-500/20 bg-orange-500/10 text-orange-400"
                                  : "border-slate-500/20 bg-slate-500/10 text-slate-400"
                              }`}
                            >
                              {request.urgency || "MEDIUM"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            {required > 0 ? (
                              <div>
                                <p className="text-sm font-bold text-white">
                                  ₹{received.toLocaleString("en-IN")} / ₹
                                  {required.toLocaleString("en-IN")}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {gap > 0
                                    ? `₹${gap.toLocaleString("en-IN")} remaining`
                                    : "Fully supported"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-500">
                                No monetary target
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                sevaStatusStyles[request.status] ||
                                sevaStatusStyles.PENDING
                              }`}
                            >
                              {(request.status || "PENDING").replace(
                                "_",
                                " "
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-400">
                            {request.hospital?.name || "Not assigned"}
                          </td>

                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSevaRequest(request);
                                setSevaNote(request.adminNotes || "");
                              }}
                              className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="pb-10">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-blue-400">
              Activity
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Appointment Overview
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Total Appointments", totalAppointments, "blue"],
              ["Completed", completedAppointments, "emerald"],
              ["Pending", pendingAppointments, "amber"],
            ].map(([label, value, accent]) => (
              <div
                key={label}
                className={`rounded-3xl border p-5 ${
                  accent === "emerald"
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : accent === "amber"
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-blue-500/20 bg-blue-500/5"
                }`}
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedDoctor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDoctor(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-400">
                  Doctor Profile
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {selectedDoctor.user?.name || "Doctor"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                {selectedDoctor.profileImage ? (
                  <img
                    src={selectedDoctor.profileImage}
                    alt={selectedDoctor.user?.name || "Doctor"}
                    className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <Icon name="doctor" size={31} />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedDoctor.user?.name || "Doctor"}
                  </h3>
                  <p className="mt-1 font-medium text-blue-400">
                    {selectedDoctor.specialization || "—"}
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                      statusStyles[selectedDoctor.status] ||
                      statusStyles.pending
                    }`}
                  >
                    {selectedDoctor.status || "pending"}
                  </span>
                </div>
              </div>

<div className="grid gap-4 sm:grid-cols-2">
  {[
    [
      "Qualification",
      selectedDoctor.qualification || "Not provided",
    ],
    [
      "Experience",
      `${selectedDoctor.experience ?? 0} years`,
    ],
    [
      "Consultation Fee",
      `₹${selectedDoctor.consultationFee ?? 0}`,
    ],
    [
      "City",
      selectedDoctor.city ||
        selectedDoctor.hospital?.city ||
        "Not provided",
    ],
    [
      "Hospital",
      selectedDoctor.hospital?.name ||
        "Not provided",
    ],
    [
      "Email",
      selectedDoctor.user?.email ||
        "Not provided",
    ],
    [
      "Phone",
      selectedDoctor.user?.phone ||
        "Not provided",
    ],
  ].map(([label, value], index) => (
    <div
      key={label}
      className={`rounded-2xl border border-white/5 bg-white/5 p-4 ${
        index === 4 ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  ))}
</div>

              {selectedDoctor.about && (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    About
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {selectedDoctor.about}
                  </p>
                </div>
              )}

              {selectedDoctor.status === "rejected" &&
                selectedDoctor.rejectionReason && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-400">
                      Rejection Reason
                    </p>
                    <p className="mt-2 text-sm leading-6 text-red-300">
                      {selectedDoctor.rejectionReason}
                    </p>
                  </div>
                )}

              {selectedDoctor.status === "pending" && (
                <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
                  <button
                    type="button"
                    disabled={actionLoading === selectedDoctor._id}
                    onClick={() => approveDoctor(selectedDoctor._id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    <Icon name="check" size={17} />
                    {actionLoading === selectedDoctor._id
                      ? "Processing..."
                      : "Approve Doctor"}
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading === selectedDoctor._id}
                    onClick={() => openRejectModal(selectedDoctor)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50"
                  >
                    <Icon name="close" size={17} />
                    Reject Doctor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedSevaRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedSevaRequest(null);
              setSevaNote("");
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                  SevaCare Review
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {selectedSevaRequest.title || "Healthcare Support Request"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {sevaTypeLabel(selectedSevaRequest.requestType)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSevaRequest(null);
                  setSevaNote("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Patient", selectedSevaRequest.patient?.name || "Patient"],
                  ["Email", selectedSevaRequest.patient?.email || "Not provided"],
                  ["Phone", selectedSevaRequest.patient?.phone || "Not provided"],
                  ["Medical Condition", selectedSevaRequest.medicalCondition || "Not provided"],
                  ["Hospital", selectedSevaRequest.hospital?.name || "Not assigned"],
                  ["Hospital City", selectedSevaRequest.hospital?.city || "Not provided"],
                  ["Blood Group", selectedSevaRequest.bloodGroup || "Not provided"],
                  ["Urgency", selectedSevaRequest.urgency || "MEDIUM"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/5 bg-white/5 p-4"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-200">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {selectedSevaRequest.description || "No description provided."}
                </p>
              </div>

              {selectedSevaRequest.medicineDetails && (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Medicine Details
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {selectedSevaRequest.medicineDetails}
                  </p>
                </div>
              )}

              {selectedSevaRequest.equipmentDetails && (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Equipment Details
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {selectedSevaRequest.equipmentDetails}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-400">
                    Required
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    ₹{Number(selectedSevaRequest.requiredAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-400">
                    Donated
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    ₹{Number(selectedSevaRequest.receivedAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-400">
                    Remaining
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    ₹{Math.max(
                      0,
                      Number(selectedSevaRequest.requiredAmount || 0) -
                        Number(selectedSevaRequest.receivedAmount || 0)
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {Number(selectedSevaRequest.requiredAmount || 0) > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-bold text-white">
                    Update Donated Treatment / Support Amount
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Record the amount actually received for this patient's treatment support.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="number"
                      min="0"
                      max={Number(selectedSevaRequest.requiredAmount || 0)}
                      defaultValue={selectedSevaRequest.receivedAmount || 0}
                      id="seva-donation-amount"
                      className="h-11 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold text-white outline-none focus:border-blue-500/40"
                    />

                    <button
                      type="button"
                      disabled={actionLoading === `donation-${selectedSevaRequest._id}`}
                      onClick={() => {
                        const input = document.getElementById(
                          "seva-donation-amount"
                        );
                        updateSevaDonation(
                          selectedSevaRequest._id,
                          input?.value || 0
                        );
                      }}
                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {actionLoading === `donation-${selectedSevaRequest._id}`
                        ? "Saving..."
                        : "Save Donation"}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Admin Notes
                </label>
                <textarea
                  value={sevaNote}
                  onChange={(event) => setSevaNote(event.target.value)}
                  rows={4}
                  placeholder="Add an internal note about this SevaCare request..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-white/10"
                />
              </div>

              {selectedSevaRequest.rejectionReason && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-400">
                    Rejection Reason
                  </p>
                  <p className="mt-2 text-sm leading-6 text-red-300">
                    {selectedSevaRequest.rejectionReason}
                  </p>
                </div>
              )}

              <div className="border-t border-white/10 pt-5">
                <p className="mb-3 text-sm font-bold text-white">
                  Update Request Status
                </p>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["APPROVED", "Approve", "bg-emerald-600 hover:bg-emerald-500"],
                    ["IN_PROGRESS", "Start Support", "bg-blue-600 hover:bg-blue-500"],
                    ["COMPLETED", "Mark Completed", "bg-violet-600 hover:bg-violet-500"],
                    ["REJECTED", "Reject", "bg-red-600 hover:bg-red-500"],
                    ["PENDING", "Set Pending", "bg-amber-600 hover:bg-amber-500"],
                    ["CANCELLED", "Cancel", "bg-slate-700 hover:bg-slate-600"],
                  ].map(([status, label, style]) => (
                    <button
                      key={status}
                      type="button"
                      disabled={actionLoading === `seva-${selectedSevaRequest._id}`}
                      onClick={() => updateSevaStatus(selectedSevaRequest._id, status)}
                      className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${style}`}
                    >
                      {actionLoading === `seva-${selectedSevaRequest._id}`
                        ? "Updating..."
                        : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-400">
                  Doctor Review
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Reject Doctor
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Provide a reason for rejecting{" "}
                  <span className="font-semibold text-slate-300">
                    {rejectingDoctor.user?.name || "this doctor"}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setRejectingDoctor(null);
                  setRejectionReason("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <Icon name="close" size={17} />
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Rejection Reason
              </label>

              <textarea
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                rows={5}
                placeholder="Explain why this doctor profile is being rejected..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-red-500 focus:bg-white/10"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setRejectingDoctor(null);
                  setRejectionReason("");
                }}
                className="flex-1 rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading === rejectingDoctor._id}
                onClick={rejectDoctor}
                className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === rejectingDoctor._id
                  ? "Rejecting..."
                  : "Reject Doctor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
export default AdminDashboard;