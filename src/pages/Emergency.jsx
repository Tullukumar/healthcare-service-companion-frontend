import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import AmbulanceCall from "../components/AmbulanceCall";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE_URL = "http://localhost:5000";


const currentLocationIcon = L.divIcon({
  className: "healthcompanion-location-marker",
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      background: #22d3ee;
      border: 4px solid #ffffff;
      box-shadow: 0 0 0 8px rgba(34, 211, 238, 0.20), 0 8px 20px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

function RecenterMap({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    map.setView(
      [latitude, longitude],
      Math.max(map.getZoom(), 17),
      {
        animate: true,
      }
    );
  }, [map, latitude, longitude]);

  return null;
}

function LocationMap({
  latitude,
  longitude,
  accuracy,
}) {
  const safeAccuracy =
    Number.isFinite(Number(accuracy)) &&
    Number(accuracy) > 0
      ? Number(accuracy)
      : 20;

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950">
      <div className="flex flex-col gap-2 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-white">
            Exact GPS Location
          </p>

          <p className="mt-1 text-xs text-slate-500">
            The pin shows the location provided by your device GPS.
          </p>
        </div>

        <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
          Accuracy ±{Math.round(safeAccuracy)} m
        </span>
      </div>

      <MapContainer
        center={[latitude, longitude]}
        zoom={17}
        scrollWheelZoom
        className="h-96 w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap
          latitude={latitude}
          longitude={longitude}
        />

        <Circle
          center={[latitude, longitude]}
          radius={safeAccuracy}
          pathOptions={{
            color: "#22d3ee",
            fillColor: "#22d3ee",
            fillOpacity: 0.12,
            weight: 1.5,
          }}
        />

        <Marker
          position={[latitude, longitude]}
          icon={currentLocationIcon}
        >
          <Popup>
            <div>
              <strong>Emergency Location</strong>
              <br />
              GPS coordinates detected from your device.
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      <div className="grid gap-3 border-t border-white/10 p-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Latitude
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-white">
            {Number(latitude).toFixed(6)}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Longitude
          </p>

          <p className="mt-1 break-all text-sm font-semibold text-white">
            {Number(longitude).toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9Z" />
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

  if (name === "ambulance") {
    return (
      <svg {...common}>
        <path d="M3 17V8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9" />
        <path d="M16 10h3l2 3v4h-5" />
        <path d="M7 17h7" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 10h4M10 8v4" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3 20 6v5c0 5-3.4 8.8-8 10-4.6-1.2-8-5-8-10V6z" />
        <path d="m9 12 2 2 4-4" />
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

  if (name === "chat") {
    return (
      <svg {...common}>
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4A8.4 8.4 0 0 1 3 11.5a8.5 8.5 0 1 1 18 0Z" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  return null;
}

function formatStatus(status) {
  if (!status) {
    return "Unknown";
  }

  return status
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function getStatusDescription(status) {
  switch (status) {
    case "requested":
      return "Your request has been sent. We are waiting for an ambulance driver to accept it.";

    case "accepted":
      return "An ambulance driver has accepted your emergency request.";

    case "on-the-way":
      return "The ambulance is on the way to your pickup location.";

    case "arrived":
      return "The ambulance has arrived at your pickup location.";

    case "completed":
      return "Your ambulance emergency has been completed.";

    case "cancelled":
      return "This ambulance request has been cancelled.";

    default:
      return "Your ambulance request is being processed.";
  }
}

const STATUS_STEPS = [
  {
    key: "requested",
    label: "Request Sent",
  },
  {
    key: "accepted",
    label: "Accepted",
  },
  {
    key: "on-the-way",
    label: "On the Way",
  },
  {
    key: "arrived",
    label: "Arrived",
  },
  {
    key: "completed",
    label: "Completed",
  },
];

function getStatusIndex(status) {
  return STATUS_STEPS.findIndex(
    (step) => step.key === status
  );
}

function Emergency() {
  const seenAmbulanceMessageKeysRef = useRef(new Map());
  const [pickupAddress, setPickupAddress] =
    useState("");

  const [emergencyType, setEmergencyType] =
    useState("Medical Emergency");

  const [notes, setNotes] = useState("");

  const [pickupLocation, setPickupLocation] =
    useState(null);

  const [locationAccuracy, setLocationAccuracy] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [activeLoading, setActiveLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Active ambulance emergency
  const [activeRequest, setActiveRequest] =
    useState(null);

  // Chat
  const [chatOpen, setChatOpen] =
    useState(false);

  const [chatMessage, setChatMessage] =
    useState("");

  const [chatMessages, setChatMessages] =
    useState([]);

  // ==========================================
  // FETCH PATIENT ACTIVE REQUEST
  // ==========================================

  const fetchActiveRequest = async () => {
    const token =
      localStorage.getItem("token");

    if (!token) {
      setActiveLoading(false);
      return null;
    }

    try {
      setActiveLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/ambulance-requests/active`,
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
            "Failed to fetch active ambulance request."
        );
      }

      if (
        data.hasActiveRequest &&
        data.request
      ) {
        setActiveRequest(data.request);

        return data.request;
      }

      setActiveRequest(null);

      return null;
    } catch (err) {
      console.error(
        "Fetch patient active ambulance request error:",
        err
      );

      /*
       * Don't show a scary error if there simply
       * isn't an active request.
       */
      if (
        err.message &&
        !err.message
          .toLowerCase()
          .includes("not found")
      ) {
        setError(err.message);
      }

      return null;
    } finally {
      setActiveLoading(false);
    }
  };

  // ==========================================
  // PATIENT SOCKET
  // ==========================================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const userData =
      localStorage.getItem("user");

    if (!token || !userData) {
      return;
    }

    let currentUser;

    try {
      currentUser = JSON.parse(userData);
    } catch {
      return;
    }

    if (currentUser?.role !== "patient") {
      return;
    }

    // Recover the request asynchronously to avoid updating state
    // synchronously while this effect is running.
    Promise.resolve().then(() => fetchActiveRequest());

    let socket =
      window.__healthCompanionPatientSocket;

    if (!socket) {
      socket = io(API_BASE_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        withCredentials: true,
      });

      window.__healthCompanionPatientSocket =
        socket;
    }

    const patientId =
      currentUser?._id ||
      currentUser?.id;

    const joinPatientRoom = () => {
      if (!patientId) {
        return;
      }

      socket.emit(
        "join-patient-room",
        patientId
      );

      console.log(
        "👤 Patient joined room:",
        `patient:${patientId}`
      );
    };

    const handleConnect = () => {
      console.log(
        "Patient socket connected:",
        socket.id
      );

      joinPatientRoom();
    };

    if (socket.connected) {
      joinPatientRoom();
    } else {
      socket.on("connect", handleConnect);
    }


    socket.on(
      "connect_error",
      (socketError) => {
        console.error(
          "Patient socket connection error:",
          socketError.message
        );
      }
    );

    // ==========================================
    // AMBULANCE ACCEPTED
    // ==========================================

    socket.on(
      "ambulance:request-accepted",
      (acceptedRequest) => {
        if (!acceptedRequest?._id) {
          return;
        }

        setActiveRequest(
          acceptedRequest
        );

        setChatMessages([]);

        setChatOpen(false);

        const vehicleNumber =
          acceptedRequest.ambulance
            ?.vehicleNumber;

        setSuccess(
          vehicleNumber
            ? `Ambulance ${vehicleNumber} has accepted your emergency request.`
            : "An ambulance driver has accepted your emergency request."
        );
      }
    );

    // ==========================================
    // AMBULANCE STATUS UPDATE
    // ==========================================

    socket.on(
      "ambulance:request-status",
      (updatedRequest) => {
        if (!updatedRequest?._id) {
          return;
        }

        setActiveRequest(
          (previousRequest) => {
            /*
             * If this is our current request,
             * replace it with the latest version.
             *
             * If we haven't loaded it yet, also accept
             * the incoming request.
             */
            if (
              !previousRequest ||
              previousRequest._id ===
                updatedRequest._id
            ) {
              return updatedRequest;
            }

            return previousRequest;
          }
        );

        if (
          updatedRequest.status ===
          "accepted"
        ) {
          setSuccess(
            "Your ambulance request has been accepted."
          );
        }

        if (
          updatedRequest.status ===
          "on-the-way"
        ) {
          setSuccess(
            "Your ambulance is on the way."
          );
        }

        if (
          updatedRequest.status ===
          "arrived"
        ) {
          setSuccess(
            "Your ambulance has arrived."
          );
        }

        if (
          updatedRequest.status ===
          "completed"
        ) {
          setSuccess(
            "Your ambulance emergency has been completed."
          );

          setChatOpen(false);
          setChatMessage("");
        }

        if (
          updatedRequest.status ===
          "cancelled"
        ) {
          setError(
            "Your ambulance request was cancelled."
          );

          setChatOpen(false);
          setChatMessage("");
        }
      }
    );

    // ==========================================
    // CHAT MESSAGE
    // ==========================================

    const handleAmbulanceChatMessage = (
      incomingMessage
    ) => {
      if (
        !incomingMessage?.requestId ||
        !incomingMessage?.senderId ||
        !incomingMessage?.receiverId ||
        !incomingMessage?.senderRole ||
        !incomingMessage?.text
      ) {
        return;
      }

      const messageId =
        incomingMessage.messageId || null;

      const fallbackKey = [
        incomingMessage.requestId,
        incomingMessage.senderId,
        incomingMessage.receiverId,
        incomingMessage.senderRole,
        String(incomingMessage.text).trim(),
      ].join("|");

      const key =
        messageId || fallbackKey;

      const now = Date.now();
      const seenMessages =
        seenAmbulanceMessageKeysRef.current;

      // Ignore the same message if Socket.IO/server
      // delivers it more than once within a short window.
      const previousSeenAt =
        seenMessages.get(key);

      if (
        previousSeenAt &&
        now - previousSeenAt < 3000
      ) {
        console.log(
          "⚠️ Duplicate ambulance message ignored:",
          key
        );
        return;
      }

      seenMessages.set(key, now);

      // Keep the map small.
      for (const [storedKey, storedAt] of seenMessages) {
        if (now - storedAt > 10000) {
          seenMessages.delete(storedKey);
        }
      }

      setChatMessages((previousMessages) => {
        const alreadyExists =
          messageId
            ? previousMessages.some(
                (message) =>
                  message.messageId ===
                  messageId
              )
            : previousMessages.some(
                (message) => {
                  const existingKey = [
                    message.requestId,
                    message.senderId,
                    message.receiverId,
                    message.senderRole,
                    String(message.text || "").trim(),
                  ].join("|");

                  return existingKey === key;
                }
              );

        if (alreadyExists) {
          return previousMessages;
        }

        return [
          ...previousMessages,
          incomingMessage,
        ];
      });
    };


    socket.on(
      "ambulance:chat-message",
      handleAmbulanceChatMessage
    );

    return () => {
      socket.off("connect", handleConnect);

      socket.off(
        "ambulance:chat-message",
        handleAmbulanceChatMessage
      );

      socket.off(
        "ambulance:request-accepted"
      );

      socket.off(
        "ambulance:request-status"
      );

      socket.off("connect_error");

      if (
        window.__healthCompanionPatientSocket ===
        socket
      ) {
        socket.disconnect();
        window.__healthCompanionPatientSocket =
          null;
      }
    };
  }, []);

// ==========================================
// SEND CHAT MESSAGE
// ==========================================

const sendChatMessage = () => {
  const text = chatMessage.trim();

  if (!text || !activeRequest) {
    return;
  }

  const chatAllowedStatuses = [
    "accepted",
    "on-the-way",
    "arrived",
  ];

  if (!chatAllowedStatuses.includes(activeRequest.status)) {
    setError(
      "Chat will be available after an ambulance driver accepts your request."
    );
    return;
  }

  const socket =
    window.__healthCompanionPatientSocket;

  if (!socket || !socket.connected) {
    setError(
      "Chat connection is not available. Please try again."
    );
    return;
  }

  const receiverId =
    activeRequest.ambulance?.driver?._id ||
    activeRequest.ambulance?.driver;

  if (!receiverId) {
    setError(
      "Ambulance driver information is not available yet."
    );
    return;
  }

  let currentUser = null;

  try {
    currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    console.error(
      "Failed to parse user:",
      error
    );
  }

  const patientId =
    currentUser?._id ||
    currentUser?.id;

  if (!patientId) {
    setError(
      "Patient information is unavailable."
    );
    return;
  }

  const messageId =
    `${activeRequest._id}-${patientId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

  const outgoingMessage = {
    messageId,
    requestId: String(activeRequest._id),
    senderId: String(patientId),
    receiverId: String(receiverId),
    senderRole: "patient",
    text,
    createdAt: new Date().toISOString(),
  };

  console.log(
    "📤 Patient → Driver:",
    outgoingMessage
  );

  // Mark our own message as seen before emitting so a
  // duplicate echo can never add it a second time.
  seenAmbulanceMessageKeysRef.current.set(
    messageId,
    Date.now()
  );

  socket.emit(
    "ambulance:chat-message",
    outgoingMessage
  );

  setChatMessages((previousMessages) => {
    const exists = previousMessages.some(
      (message) =>
        message.messageId === messageId
    );

    if (exists) {
      return previousMessages;
    }

    return [
      ...previousMessages,
      outgoingMessage,
    ];
  });

  setChatMessage("");
};

  // ==========================================
  // GET LOCATION
  // ==========================================

  const getLocation = () => {
    setError("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );

      setLocationLoading(false);

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickupLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        });

        setLocationAccuracy(
          Number.isFinite(
            position.coords.accuracy
          )
            ? position.coords.accuracy
            : null
        );

        setLocationLoading(false);
      },

      () => {
        setError(
          "Unable to access your location. Please enter your pickup address."
        );

        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================
  // REQUEST AMBULANCE
  // ==========================================

  const requestAmbulance = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
     * Don't allow another ambulance request
     * while one is already active.
     */
    if (activeRequest) {
      setError(
        "You already have an active ambulance request. Please complete it before creating another request."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    const user =
      localStorage.getItem("user");

    if (!token) {
      setError(
        "Please login before requesting an ambulance."
      );

      return;
    }

    if (!pickupLocation) {
      setError(
        "Please share your current location first."
      );

      return;
    }

    let patient;

    try {
      patient = JSON.parse(user);
    } catch {
      patient = null;
    }

    if (!patient) {
      setError(
        "Patient information could not be found. Please login again."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/ambulance-requests`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            pickupAddress:
              pickupAddress.trim() ||
              "GPS Location",

            pickupLocation: {
              latitude:
                pickupLocation.latitude,

              longitude:
                pickupLocation.longitude,
            },

            emergencyType,

            notes: notes.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to request ambulance."
        );
      }

      if (data.success) {
        if (data.request?._id) {
          setActiveRequest(
            data.request
          );
        }

        /*
         * IMPORTANT:
         * A newly created request is NOT accepted yet.
         */
        setSuccess(
          "Emergency request submitted successfully. We are waiting for an ambulance driver to accept the request."
        );

        setPickupAddress("");
        setNotes("");
      } else {
        throw new Error(
          data.message ||
            "Unable to create ambulance request."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // ACTIVE REQUEST HELPERS
  // ==========================================

  const currentStatus =
    activeRequest?.status ||
    null;

  const currentStatusIndex =
    getStatusIndex(currentStatus);

  const chatAllowedStatuses = [
    "accepted",
    "on-the-way",
    "arrived",
  ];

  const canChat =
    activeRequest &&
    chatAllowedStatuses.includes(
      activeRequest.status
    );

    
  const driver =
    activeRequest?.ambulance?.driver;

  const driverName =
    activeRequest?.ambulance
      ?.driverName ||
    driver?.name ||
    "Ambulance Driver";

  const vehicleNumber =
    activeRequest?.ambulance
      ?.vehicleNumber ||
    activeRequest?.vehicleNumber ||
    "";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-950 px-5 pb-20 pt-24 text-white sm:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ====================================
            HERO
        ==================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-red-400/20 bg-white/5 p-7 shadow-2xl sm:p-10 lg:p-14">

          <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-red-300">

                <span className="h-2 w-2 rounded-full bg-red-400" />

                Emergency Response

              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Get emergency assistance when every second matters.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Share your location and request an ambulance through
                HealthCompanion.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <a
                  href="tel:112"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-400"
                >
                  <Icon
                    name="phone"
                    size={18}
                  />

                  Call 112
                </a>

                <a
                  href="#ambulance-request"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:border-red-400/30 hover:bg-white/10"
                >
                  Request Ambulance

                  <Icon
                    name="arrow"
                    size={18}
                  />
                </a>

              </div>

            </div>

            {/* EMERGENCY STATUS CARD */}

            <div className="rounded-3xl border border-red-400/10 bg-slate-900/70 p-6 backdrop-blur-xl sm:p-8">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Emergency Network
                  </p>

                  <p className="mt-2 text-xl font-bold text-white">
                    Rapid response
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">

                  <Icon
                    name="ambulance"
                    size={25}
                  />

                </div>

              </div>

              <div className="mt-7 space-y-3">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                  <div className="flex items-center gap-3">

                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Emergency request
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Submit your location and emergency details
                      </p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">

                  <div className="flex items-center gap-3">

                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />

                    <div>

                      <p className="text-sm font-semibold text-white">
                        Location sharing
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        GPS coordinates can be sent with your request
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================
            EMERGENCY NOTICE
        ==================================== */}

        <section className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">

          <div className="flex items-start gap-4">

            <div className="mt-0.5 text-red-300">
              <Icon
                name="shield"
                size={22}
              />
            </div>

            <div>

              <h2 className="font-bold text-red-200">
                For life-threatening emergencies
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-400">
                Call your local emergency service immediately. In India,
                you can call{" "}
                <strong className="text-white">
                  112
                </strong>
                . The ambulance request below is an additional platform
                service and should not replace emergency services.
              </p>

            </div>

          </div>

        </section>

        {/* ====================================
            ACTIVE AMBULANCE STATUS
        ==================================== */}

        {activeLoading ? (
          <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-8">

            <div className="flex items-center gap-3">

              <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />

              <p className="text-sm text-slate-400">
                Checking your ambulance request...
              </p>

            </div>

          </section>
        ) : (
          activeRequest && (
            <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-white/5 p-6 shadow-2xl shadow-cyan-950/10 sm:p-8">

              {/* HEADER */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                    Live Emergency
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold text-white">
                    Ambulance Response
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    {getStatusDescription(
                      currentStatus
                    )}
                  </p>

                </div>

                <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
                  {formatStatus(
                    currentStatus
                  )}
                </span>

              </div>

              {/* STATUS TIMELINE */}

              <div className="mt-8">

                <div className="grid gap-3 sm:grid-cols-5">

                  {STATUS_STEPS.map(
                    (step, index) => {

                      const completed =
                        currentStatusIndex >=
                        index &&
                        currentStatus !==
                          "cancelled";

                      const current =
                        currentStatus ===
                        step.key;

                      return (
                        <div
                          key={step.key}
                          className="relative"
                        >

                          <div
                            className={`rounded-2xl border p-4 ${
                              current
                                ? "border-cyan-400/40 bg-cyan-400/10"
                                : completed
                                  ? "border-emerald-400/20 bg-emerald-400/5"
                                  : "border-white/10 bg-white/5"
                            }`}
                          >

                            <div className="flex items-center gap-3">

                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                  current
                                    ? "bg-cyan-400 text-slate-950"
                                    : completed
                                      ? "bg-emerald-400 text-slate-950"
                                      : "bg-white/10 text-slate-500"
                                }`}
                              >
                                {completed ? (
                                  <Icon
                                    name="check"
                                    size={17}
                                  />
                                ) : (
                                  <span className="text-xs font-bold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>

                              <div>

                                <p
                                  className={`text-xs font-bold ${
                                    current
                                      ? "text-cyan-300"
                                      : completed
                                        ? "text-emerald-300"
                                        : "text-slate-500"
                                  }`}
                                >
                                  {step.label}
                                </p>

                                {current && (
                                  <p className="mt-1 text-[11px] text-slate-500">
                                    Current
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              {/* AMBULANCE + EMERGENCY DETAILS */}

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {/* AMBULANCE */}

                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">

                      <Icon
                        name="ambulance"
                        size={21}
                      />

                    </div>

                    <div>

                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Ambulance
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {vehicleNumber ||
                          "Waiting for assignment"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* EMERGENCY */}

                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                  <p className="text-xs uppercase tracking-widest text-slate-500">
                    Emergency
                  </p>

                  <p className="mt-2 text-lg font-bold text-white">
                    {activeRequest.emergencyType ||
                      "Medical Emergency"}
                  </p>

                </div>

              </div>

              {/* DRIVER DETAILS */}

              {canChat && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                        Assigned Driver
                      </p>

                      <p className="mt-2 text-xl font-bold text-white">
                        {driverName}
                      </p>

                      {vehicleNumber && (
                        <p className="mt-1 text-sm text-slate-400">
                          Ambulance:{" "}
                          {vehicleNumber}
                        </p>
                      )}

                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">

<AmbulanceCall
  role="patient"
  requestId={activeRequest?._id}
  receiverId={
    activeRequest?.ambulance?.driver?._id ||
    activeRequest?.ambulance?.driver
  }
  receiverName={
    activeRequest?.ambulance?.driverName ||
    activeRequest?.ambulance?.driver?.name ||
    "Ambulance Driver"
  }
  socket={
    window.__healthCompanionPatientSocket
  }
/>

                      <button
                        type="button"
                        onClick={() =>
                          setChatOpen(
                            (previous) =>
                              !previous
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                      >
                        <Icon
                          name="chat"
                          size={18}
                        />

                        {chatOpen
                          ? "Close Chat"
                          : "Chat Driver"}
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* WAITING FOR ACCEPTANCE */}

              {currentStatus ===
                "requested" && (
                <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">

                  <div className="flex items-start gap-3">

                    <div className="mt-0.5 text-amber-300">
                      <Icon
                        name="clock"
                        size={20}
                      />
                    </div>

                    <div>

                      <p className="font-semibold text-amber-200">
                        Waiting for an ambulance driver
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Your request has been sent to available ambulance drivers.
                        Chat and driver contact will become available as soon as a
                        driver accepts your request.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* CHAT */}

              {chatOpen &&
                canChat && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">

                    <div className="border-b border-white/10 px-5 py-4">

                      <p className="font-semibold text-white">
                        Driver Chat
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {driverName}
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
                            (
                              item,
                              index
                            ) => {

                              const isPatient =
                                item.senderRole ===
                                "patient";

                              return (
                                <div
                                  key={`${item.timestamp}-${index}`}
                                  className={`flex ${
                                    isPatient
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >

                                  <div
                                    className={`max-w-4xl rounded-2xl px-4 py-3 text-sm ${
                                      isPatient
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
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            sendChatMessage();
                          }
                        }}
                        placeholder="Message your driver..."
                        maxLength={500}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                      />

                      <button
                        type="button"
                        onClick={
                          sendChatMessage
                        }
                        disabled={
                          !chatMessage.trim()
                        }
                        className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Send
                      </button>

                    </div>

                  </div>
                )}

              {/* COMPLETED */}

              {currentStatus ===
                "completed" && (
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-slate-950">

                      <Icon
                        name="check"
                        size={18}
                      />

                    </div>

                    <div>

                      <p className="font-bold text-emerald-200">
                        Emergency completed
                      </p>

                      <p className="mt-1 text-sm text-emerald-200/70">
                        The ambulance service for this request has been completed.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* CANCELLED */}

              {currentStatus ===
                "cancelled" && (
                <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-5">

                  <p className="font-bold text-red-200">
                    Ambulance request cancelled
                  </p>

                  <p className="mt-1 text-sm text-red-200/70">
                    This request is no longer active.
                  </p>

                </div>
              )}

              {/* PICKUP LOCATION */}

              {activeRequest.pickupLocation &&
                Number.isFinite(
                  Number(
                    activeRequest
                      .pickupLocation
                      .latitude
                  )
                ) &&
                Number.isFinite(
                  Number(
                    activeRequest
                      .pickupLocation
                      .longitude
                  )
                ) && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      Pickup Location
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      {activeRequest.pickupAddress ||
                        "GPS Location"}
                    </p>

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

                  </div>
                )}

            </section>
          )
        )}

        {/* ====================================
            REQUEST FORM
        ==================================== */}

        <section
          id="ambulance-request"
          className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 lg:p-10"
        >

          <div className="max-w-2xl">

            <p className="text-xs font-bold uppercase tracking-widest text-red-300">
              Ambulance request
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              Tell us where help is needed.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Share your current GPS location and provide any useful details
              about the emergency.
            </p>

          </div>

          <form
            onSubmit={requestAmbulance}
            className="mt-8"
          >

            {/* LOCATION */}

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">

                    <Icon
                      name="location"
                      size={21}
                    />

                  </div>

                  <div>

                    <p className="font-bold text-white">
                      Current location
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {pickupLocation
                        ? "GPS location captured. Check the map and pin below."
                        : "Your location is required for an ambulance request."}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <Icon
                    name="location"
                    size={18}
                  />

                  {locationLoading
                    ? "Getting location..."
                    : pickupLocation
                      ? "Update location"
                      : "Share location"}

                </button>

              </div>

            </div>

            {/* LOCATION MAP */}

            {pickupLocation && (
              <LocationMap
                latitude={
                  pickupLocation.latitude
                }
                longitude={
                  pickupLocation.longitude
                }
                accuracy={
                  locationAccuracy
                }
              />
            )}

            {/* ADDRESS */}

            <div className="mt-5">

              <label className="text-sm font-semibold text-slate-300">
                Pickup address
              </label>

              <input
                type="text"
                value={pickupAddress}
                onChange={(event) =>
                  setPickupAddress(
                    event.target.value
                  )
                }
                placeholder="Enter a nearby address or landmark"
                disabled={
                  Boolean(activeRequest)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              />

            </div>

            {/* EMERGENCY TYPE */}

            <div className="mt-5">

              <label className="text-sm font-semibold text-slate-300">
                Emergency type
              </label>

              <select
                value={emergencyType}
                onChange={(event) =>
                  setEmergencyType(
                    event.target.value
                  )
                }
                disabled={
                  Boolean(activeRequest)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <option>
                  Medical Emergency
                </option>

                <option>
                  Accident
                </option>

                <option>
                  Breathing Problem
                </option>

                <option>
                  Chest Pain
                </option>

                <option>
                  Unconscious Person
                </option>

                <option>
                  Other
                </option>

              </select>

            </div>

            {/* NOTES */}

            <div className="mt-5">

              <label className="text-sm font-semibold text-slate-300">
                Additional information
              </label>

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                rows="4"
                disabled={
                  Boolean(activeRequest)
                }
                placeholder="Describe anything the ambulance team should know..."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
              />

            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300">
                {success}
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                loading ||
                Boolean(activeRequest)
              }
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Icon
                name="ambulance"
                size={20}
              />

              {activeRequest
                ? "Active Ambulance Request"
                : loading
                  ? "Sending emergency request..."
                  : "Request Ambulance"}

            </button>

          </form>

        </section>

        {/* ====================================
            FOOTER CTA
        ==================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-7 text-center sm:p-9">

          <p className="text-sm text-slate-400">
            Need regular healthcare instead?
          </p>

          <Link
            to="/doctors"
            className="mt-3 inline-flex items-center gap-2 font-bold text-cyan-300 hover:text-cyan-200"
          >
            Find a doctor

            <Icon
              name="arrow"
              size={18}
            />
          </Link>

        </section>

      </div>

    </main>
  );
}

export default Emergency;