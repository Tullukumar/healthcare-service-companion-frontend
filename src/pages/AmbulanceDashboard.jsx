import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

import { useNavigate } from "react-router-dom";
import AmbulanceCall from "../components/AmbulanceCall";

function AmbulanceDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [onlineLoading, setOnlineLoading] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [ambulanceStatus, setAmbulanceStatus] =
    useState("offline");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  // Prevent duplicate initial loading
  const initialLoadRef = useRef(false);

  // ==========================================
  // FETCH PENDING REQUESTS
  // ==========================================

  const fetchPendingRequests = useCallback(async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

    const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/ambulance-requests/pending`,
  {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch ambulance requests."
        );
      }

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      );
    } catch (error) {
      console.error(
        "Fetch requests error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch ambulance requests."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ==========================================
  // FETCH CURRENT ACTIVE REQUEST
  // ==========================================

  const fetchActiveRequest = useCallback(async () => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      navigate("/login");
      return null;
    }

    try {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/ambulance-requests/active`,
    {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch active ambulance request."
        );
      }

      if (data.hasActiveRequest && data.request) {
        setActiveRequest(data.request);

        /*
         * The backend request status is:
         * accepted / on-the-way / arrived
         *
         * The ambulance itself remains busy.
         */
        setAmbulanceStatus("busy");
        setIsOnline(true);

        // The driver should not see pending requests
        // while already handling an active request.
        setRequests([]);

        return data.request;
      }

      setActiveRequest(null);

      return null;
    } catch (error) {
      console.error(
        "Fetch active request error:",
        error
      );

      setError(
        error.message ||
          "Failed to fetch active ambulance request."
      );

      return null;
    }
  }, [navigate]);

  // ==========================================
  // UPDATE DRIVER ONLINE STATUS
  // ==========================================

  const updateOnlineStatus = async (nextStatus) => {
    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
      navigate("/login");
      return;
    }

    try {
      setOnlineLoading(true);
      setError("");
      setMessage("");
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/ambulances/driver/online-status`,
  {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isOnline: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update online status."
        );
      }

      setIsOnline(
        Boolean(data.ambulance?.isOnline)
      );

      setAmbulanceStatus(
        data.ambulance?.status || "offline"
      );

      setMessage(
        data.message ||
          (nextStatus
            ? "You are now online."
            : "You are now offline.")
      );

      // Refresh requests after going online
      if (nextStatus) {
        /*
         * If the ambulance is busy, restore its
         * active request instead of loading pending
         * requests.
         */
        if (data.ambulance?.status === "busy") {
          await fetchActiveRequest();
        } else {
          await fetchPendingRequests();
        }
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error(
        "Online status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update online status."
      );
    } finally {
      setOnlineLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    initialLoadRef.current = true;

    const loadDriverStatus = async () => {
      const currentToken =
        localStorage.getItem("token");

      const currentUser =
        localStorage.getItem("user");

      if (!currentToken || !currentUser) {
        navigate("/login");
        return;
      }

      let parsedUser;

      try {
        parsedUser = JSON.parse(currentUser);
      } catch (error) {
        console.error(
          "Invalid user data:",
          error
        );

        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (parsedUser?.role !== "ambulance") {
        navigate("/");
        return;
      }
try {
  const response = await fetch(
   `${import.meta.env.VITE_API_URL}/api/ambulances/driver/status`,
    {
            method: "GET",
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load driver status."
          );
        }

        const currentAmbulanceStatus =
          data.ambulance?.status || "offline";

        const currentOnlineStatus =
          Boolean(data.ambulance?.isOnline);

        setIsOnline(currentOnlineStatus);
        setAmbulanceStatus(
          currentAmbulanceStatus
        );

        // ==========================================
        // IMPORTANT:
        // IF AMBULANCE IS BUSY, RESTORE ACTIVE REQUEST
        // ==========================================

        if (currentAmbulanceStatus === "busy") {
          const activeRequest =
            await fetchActiveRequest();

          if (activeRequest) {
            setMessage(
              "You are currently handling an active emergency."
            );
          } else {
            /*
             * This should normally not happen.
             * It protects the dashboard from showing
             * pending requests when the ambulance is busy
             * but the active request cannot be found.
             */
            setMessage(
              "Your ambulance is currently busy with an active request. Please complete that request first."
            );

            setRequests([]);
          }
        } else if (currentOnlineStatus) {
          /*
           * Ambulance is available and online,
           * so load pending requests.
           */
          await fetchPendingRequests();
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error(
          "Driver status error:",
          error
        );

        setError(
          error.message ||
            "Failed to load driver status."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDriverStatus();
  }, [
    navigate,
    fetchActiveRequest,
    fetchPendingRequests,
  ]);

  // ==========================================
  // REAL-TIME SOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const currentUser =
      localStorage.getItem("user");

    if (!token || !currentUser) {
      return;
    }

    let parsedUser;

    try {
      parsedUser = JSON.parse(currentUser);
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );
      return;
    }

    if (parsedUser?.role !== "ambulance") {
      return;
    }
const socket = io(
import.meta.env.VITE_API_URL,
  {
        auth: {
          token,
        },
      }
    );

    window.__healthCompanionSocket =
      socket;

    socket.on("connect", () => {
  console.log(
    "Ambulance socket connected:",
    socket.id
  );

  const driverId =
    parsedUser?._id ||
    parsedUser?.id;

  if (driverId) {
    socket.emit(
      "join-driver-room",
      driverId
    );

    console.log(
      "Ambulance driver joined room:",
      `driver:${driverId}`
    );
  }
});

    socket.on("connect_error", (error) => {
      console.error(
        "Ambulance socket connection error:",
        error.message
      );
    });

    // ==========================================
    // NEW AMBULANCE REQUEST
    // ==========================================

    socket.on(
      "ambulance:new-request",
      (newRequest) => {
        console.log(
          "New emergency request received:",
          newRequest
        );

        /*
         * Never add a new pending request if this
         * ambulance is already handling an active
         * request.
         */
        if (activeRequest) {
          return;
        }

        setRequests(
          (previousRequests) => {
            const alreadyExists =
              previousRequests.some(
                (request) =>
                  request._id ===
                  newRequest._id
              );

            if (alreadyExists) {
              return previousRequests;
            }

            return [
              newRequest,
              ...previousRequests,
            ];
          }
        );

        setMessage(
          "New emergency request received."
        );
      }
    );

    // ==========================================
    // CHAT MESSAGE
    // ==========================================

    socket.on(
      "ambulance:chat-message",
      (incomingMessage) => {
        if (
          !incomingMessage?.requestId
        ) {
          return;
        }

        setChatMessages(
          (previousMessages) => [
            ...previousMessages,
            incomingMessage,
          ]
        );
      }
    );

    socket.on("disconnect", (reason) => {
      console.log(
        "Ambulance socket disconnected:",
        reason
      );
    });

    return () => {
      socket.disconnect();

      if (
        window.__healthCompanionSocket ===
        socket
      ) {
        window.__healthCompanionSocket =
          null;
      }
    };
  }, [activeRequest]);

  // ==========================================
  // SEND CHAT MESSAGE
  // ==========================================

  const sendChatMessage = () => {
    const text = chatMessage.trim();

    if (!text || !activeRequest) {
      return;
    }

    const socket =
      window.__healthCompanionSocket;

    if (!socket || !socket.connected) {
      setError(
        "Chat connection is not available. Please try again."
      );
      return;
    }

    const receiverId =
      activeRequest.patient?._id;

    if (!receiverId) {
      setError(
        "Patient information is unavailable."
      );
      return;
    }

    let currentUser = null;

    try {
      currentUser = JSON.parse(
        localStorage.getItem("user") ||
          "null"
      );
    } catch (error) {
      console.error(
        "Failed to parse current user:",
        error
      );
    }

const driverId =
  currentUser?._id ||
  currentUser?.id;

if (!driverId) {
  setError(
    "Driver information is unavailable."
  );
  return;
}

const outgoingMessage = {
  requestId: activeRequest._id,
  senderId: driverId,
  receiverId: receiverId,
  senderRole: "ambulance",
  text: text.trim(),
};

console.log(
  "📤 Driver sending:",
  outgoingMessage
);

socket.emit(
  "ambulance:chat-message",
  outgoingMessage
);

    setChatMessages(
      (previousMessages) => [
        ...previousMessages,
        {
          requestId:
            activeRequest._id,
          senderId:
            currentUser?._id ||
            currentUser?.id,
          senderRole: "ambulance",
          text,
          timestamp:
            new Date().toISOString(),
        },
      ]
    );

    setChatMessage("");
  };

  // ==========================================
  // ACCEPT REQUEST
  // ==========================================

  const acceptRequest = async (requestId) => {
    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
      navigate("/login");
      return;
    }

    /*
     * Frontend protection:
     * If we already have an active request,
     * do not even send another accept request.
     */
    if (activeRequest) {
      setError(
        "Your ambulance is currently busy with an active request. Please complete that request first."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");
const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/ambulance-requests/${requestId}/accept`,
  {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        /*
         * If backend tells us the ambulance is busy,
         * immediately try to recover the active request.
         */
        if (
          response.status === 400 &&
          data.message?.toLowerCase().includes(
            "busy"
          )
        ) {
          const recoveredRequest =
            await fetchActiveRequest();

          if (recoveredRequest) {
            setMessage(
              "You already have an active emergency. Please complete it before accepting another request."
            );
          }
        }

        throw new Error(
          data.message ||
            "Failed to accept ambulance request."
        );
      }

      const acceptedRequest =
        data.request ||
        data.ambulanceRequest;

      setActiveRequest(
        acceptedRequest || null
      );

      setAmbulanceStatus("busy");
      setIsOnline(true);

      setChatMessages([]);
      setChatOpen(false);
      setChatMessage("");

      setRequests(
        (previousRequests) =>
          previousRequests.filter(
            (request) =>
              request._id !== requestId
          )
      );

      setMessage(
        "Emergency request accepted successfully."
      );
    } catch (error) {
      console.error(
        "Accept request error:",
        error
      );

      /*
       * Don't overwrite the useful recovery
       * message if the active request was found.
       */
      if (!activeRequest) {
        setError(
          error.message ||
            "Failed to accept ambulance request."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // UPDATE REQUEST STATUS
  // ==========================================

  const updateStatus = async (
    requestId,
    status
  ) => {
    const currentToken =
      localStorage.getItem("token");

    if (!currentToken) {
      navigate("/login");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");
const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/ambulance-requests/${requestId}/status`,
  {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update request status."
        );
      }

      const updatedRequest =
        data.request ||
        data.ambulanceRequest;

      // ==========================================
      // COMPLETED
      // ==========================================

      if (status === "completed") {
        setActiveRequest(null);
        setAmbulanceStatus("available");
        setIsOnline(true);

        setChatOpen(false);
        setChatMessage("");
        setChatMessages([]);

        setMessage(
          "Emergency request completed successfully."
        );

        /*
         * Driver becomes available again.
         */
        setIsOnline(true);

        /*
         * Now that the active emergency is
         * completed, load new pending requests.
         */
        await fetchPendingRequests();
      } else {
        // ==========================================
        // ACTIVE STATUS UPDATE
        // ==========================================

        setActiveRequest(
          updatedRequest || {
            ...activeRequest,
            status,
          }
        );

        setAmbulanceStatus(
          updatedRequest?.ambulance
            ?.status || "busy"
        );

        setIsOnline(true);

        setMessage(
          `Request status updated to ${formatStatus(
            status
          )}.`
        );
      }
    } catch (error) {
      console.error(
        "Update status error:",
        error
      );

      setError(
        error.message ||
          "Failed to update request status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // ==========================================
  // FORMAT STATUS
  // ==========================================

  const formatStatus = (status) => {
    if (!status) {
      return "";
    }

    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
              HealthCompanion
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Ambulance Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">

            {/* ONLINE STATUS */}

            <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 sm:flex">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnline
                    ? "bg-emerald-400"
                    : "bg-slate-500"
                }`}
              />

              <span className="text-sm font-medium text-slate-200">
                {ambulanceStatus === "busy"
                  ? "Busy"
                  : isOnline
                    ? "Online"
                    : "Offline"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* ====================================
            DRIVER STATUS
        ==================================== */}

        <section className="mb-8 rounded-3xl border border-white/10 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Driver Availability
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {ambulanceStatus === "busy"
                  ? "You are handling an emergency"
                  : isOnline
                    ? "You are online"
                    : "You are offline"}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                {ambulanceStatus === "busy"
                  ? "Complete the current emergency before accepting another ambulance request."
                  : isOnline
                    ? "You can now receive nearby emergency ambulance requests."
                    : "Go online when you are ready to receive emergency requests."}
              </p>
            </div>

            <button
              type="button"
              disabled={
                onlineLoading ||
                activeRequest !== null ||
                ambulanceStatus === "busy"
              }
              onClick={() =>
                updateOnlineStatus(!isOnline)
              }
              title={
                ambulanceStatus === "busy"
                  ? "Complete the active emergency before going offline."
                  : ""
              }
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isOnline
                  ? "border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                  : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
              }`}
            >
              {onlineLoading
                ? "Updating..."
                : isOnline
                  ? "Go Offline"
                  : "Go Online"}
            </button>

          </div>
        </section>

        {/* ====================================
            WELCOME
        ==================================== */}

        <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-slate-900 p-7 shadow-2xl shadow-cyan-950/20">

          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Emergency Response
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready for the next emergency?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            View incoming emergency requests,
            accept a request, and update its
            status as you respond to the patient.
          </p>

        </section>

        {/* ====================================
            ALERTS
        ==================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {/* ====================================
            ACTIVE REQUEST
        ==================================== */}

        {activeRequest && (
          <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-white/5 p-6">

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                  Active Emergency
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {formatStatus(
                    activeRequest.status
                  )}
                </h2>
              </div>

              <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">
                Active
              </span>

            </div>

            {/* REQUEST DETAILS */}

            <div className="grid gap-4 md:grid-cols-2">

              {/* PATIENT */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Patient
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {activeRequest.patient?.name ||
                    "Patient"}
                </p>

                {activeRequest.patient?.phone && (
                  <p className="mt-1 text-sm text-slate-400">
                    {activeRequest.patient.phone}
                  </p>
                )}

              </div>

              {/* EMERGENCY TYPE */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Emergency Type
                </p>

                <p className="mt-2 text-lg font-semibold text-white">
                  {activeRequest.emergencyType ||
                    "Medical Emergency"}
                </p>

              </div>

              {/* PICKUP LOCATION */}

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 md:col-span-2">

                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Pickup Location
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {activeRequest.pickupAddress ||
                    "Patient location received"}
                </p>

                {activeRequest.pickupLocation && (
                  <p className="mt-2 text-xs text-slate-500">
                    Latitude:{" "}
                    {
                      activeRequest
                        .pickupLocation
                        .latitude
                    }{" "}
                    • Longitude:{" "}
                    {
                      activeRequest
                        .pickupLocation
                        .longitude
                    }
                  </p>
                )}

              </div>

              {/* NOTES */}

              {activeRequest.notes && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 md:col-span-2">

                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Patient Notes
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {activeRequest.notes}
                  </p>

                </div>
              )}

            </div>

            {/* STATUS ACTIONS */}

            <div className="mt-6 flex flex-wrap gap-3">

              {/* ACCEPTED -> ON THE WAY */}

              {activeRequest.status ===
                "accepted" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateStatus(
                      activeRequest._id,
                      "on-the-way"
                    )
                  }
                  className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Updating..."
                    : "Start Journey"}
                </button>
              )}

              {/* ON THE WAY -> ARRIVED */}

              {activeRequest.status ===
                "on-the-way" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateStatus(
                      activeRequest._id,
                      "arrived"
                    )
                  }
                  className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Updating..."
                    : "Mark Arrived"}
                </button>
              )}

              {/* ARRIVED -> COMPLETED */}

              {activeRequest.status ===
                "arrived" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() =>
                    updateStatus(
                      activeRequest._id,
                      "completed"
                    )
                  }
                  className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Completing..."
                    : "Complete Emergency"}
                </button>
              )}

            </div>

            {/* PATIENT COMMUNICATION */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              {activeRequest.patient?.phone && (
                <a
                  href={`tel:${activeRequest.patient.phone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z"
                    />
                  </svg>

                  Call Patient
                </a>
              )}

              <button
                type="button"
                onClick={() =>
                  setChatOpen(
                    (previous) => !previous
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4A8.4 8.4 0 0 1 3 11.5a8.5 8.5 0 1 1 18 0Z"
                  />
                </svg>

                {chatOpen
                  ? "Close Chat"
                  : "Chat Patient"}
              </button>
              <AmbulanceCall
  socket={window.__healthCompanionSocket}
  requestId={activeRequest?._id}
  receiverId={activeRequest?.patient?._id}
  receiverName={
    activeRequest?.patient?.name ||
    "Patient"
  }
  role="ambulance"
/>
            </div>

            {/* CHAT */}

            {chatOpen && activeRequest && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">

                <div className="border-b border-white/10 px-5 py-4">

                  <p className="font-semibold text-white">
                    Patient Chat
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {activeRequest.patient?.name ||
                      "Patient"}
                  </p>

                </div>

                <div className="max-h-80 min-h-48 space-y-3 overflow-y-auto p-5">

                  {chatMessages.filter(
                    (item) =>
                      item.requestId ===
                      activeRequest._id
                  ).length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No messages yet.
                    </p>
                  ) : (
                    chatMessages
                      .filter(
                        (item) =>
                          item.requestId ===
                          activeRequest._id
                      )
                      .map(
                        (item, index) => {
                          const isDriver =
                            item.senderRole ===
                            "ambulance";

                          return (
                            <div
                              key={`${item.timestamp}-${index}`}
                              className={`flex ${
                                isDriver
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-4xl rounded-2xl px-4 py-3 text-sm ${
                                  isDriver
                                    ? "bg-cyan-500 text-slate-950"
                                    : "bg-white/10 text-white"
                                }`}
                              >
                                {item.text}
                              </div>
                            </div>
                          );
                        }
                      )
                  )}

                </div>

                <div className="flex gap-3 border-t border-white/10 p-4">

                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(event) =>
                      setChatMessage(
                        event.target.value
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        sendChatMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    maxLength={500}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                  />

                  <button
                    type="button"
                    onClick={sendChatMessage}
                    disabled={!chatMessage.trim()}
                    className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send
                  </button>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ====================================
            PENDING REQUESTS
        ==================================== */}

        <section>

          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Incoming Requests
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Pending Emergencies
              </h2>
            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={fetchPendingRequests}
              disabled={
                loading ||
                !isOnline ||
                activeRequest !== null
              }
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* BUSY STATE */}

          {ambulanceStatus === "busy" &&
            activeRequest && (
              <div className="mb-5 rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-6">

                <p className="text-sm font-semibold text-cyan-300">
                  You are currently handling an active emergency.
                </p>

                <p className="mt-2 text-sm text-cyan-200/70">
                  Complete the current emergency before accepting another request.
                </p>

              </div>
            )}

          {/* OFFLINE STATE */}

          {!isOnline && !activeRequest && (
            <div className="mb-5 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-6">

              <p className="text-sm font-semibold text-amber-300">
                You are currently offline.
              </p>

              <p className="mt-2 text-sm text-amber-200/70">
                Go online to receive ambulance
                emergency requests.
              </p>

            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">

              <p className="text-sm text-slate-400">
                Loading emergency requests...
              </p>

            </div>
          ) : requests.length === 0 ? (

            /* EMPTY STATE */

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">

                <svg
                  className="h-6 w-6 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h4m4-12H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2z"
                  />
                </svg>

              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No pending requests
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                New emergency requests will
                appear here.
              </p>

            </div>

          ) : (

            /* REQUEST CARDS */

            <div className="grid gap-5 lg:grid-cols-2">

              {requests.map((request) => (

                <div
                  key={request._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/20 hover:bg-white/10"
                >

                  {/* CARD HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
                        Emergency Request
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {request.emergencyType ||
                          "Medical Emergency"}
                      </h3>

                    </div>

                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                      Requested
                    </span>

                  </div>

                  {/* REQUEST DETAILS */}

                  <div className="mt-6 space-y-4">

                    {/* PATIENT */}

                    <div>

                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Patient
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-200">
                        {request.patient?.name ||
                          "Patient"}
                      </p>

                      {request.patient?.phone && (
                        <p className="mt-1 text-xs text-slate-500">
                          {request.patient.phone}
                        </p>
                      )}

                    </div>

                    {/* PICKUP */}

                    <div>

                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Pickup
                      </p>

                      <p className="mt-1 text-sm text-slate-300">
                        {request.pickupAddress ||
                          "Location coordinates available"}
                      </p>

                      {request.pickupLocation && (
                        <p className="mt-1 text-xs text-slate-500">
                          {
                            request
                              .pickupLocation
                              .latitude
                          }
                          ,{" "}
                          {
                            request
                              .pickupLocation
                              .longitude
                          }
                        </p>
                      )}

                    </div>

                    {/* NOTES */}

                    {request.notes && (
                      <div>

                        <p className="text-xs uppercase tracking-widest text-slate-500">
                          Notes
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {request.notes}
                        </p>

                      </div>
                    )}

                  </div>

                  {/* ACCEPT BUTTON */}

                  <button
                    type="button"
                    disabled={
                      actionLoading ||
                      activeRequest !== null ||
                      ambulanceStatus === "busy" ||
                      !isOnline
                    }
                    onClick={() =>
                      acceptRequest(
                        request._id
                      )
                    }
                    className="mt-6 w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading
                      ? "Accepting..."
                      : "Accept Emergency"}
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default AmbulanceDashboard;