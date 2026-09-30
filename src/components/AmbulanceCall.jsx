import { useCallback, useEffect, useRef, useState } from "react";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const secs = (seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${secs}`;
}

function CallIcon({ type, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.1 5.18 2 2 0 0 1 5.08 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.3 1.73.51 2.63.63A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (type === "mic") {
    return (
      <svg {...common}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
        <path d="M8 21h8" />
      </svg>
    );
  }

  if (type === "speaker") {
    return (
      <svg {...common}>
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    );
  }

  return null;
}

export default function AmbulanceCall({
  socket,
  requestId,
  receiverId,
  receiverName = "Ambulance Driver",
  role = "patient",
  disabled = false,
}) {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const mountedRef = useRef(true);

  const [callState, setCallState] = useState("idle");
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  const [incomingCall, setIncomingCall] = useState(null);

  const safeRequestId = requestId
    ? String(requestId)
    : null;

  const safeReceiverId = receiverId
    ? String(receiverId)
    : null;

  const getCurrentUserId = () => {
    try {
      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      return String(user?._id || user?.id || "");
    } catch {
      return "";
    }
  };

  const cleanupPeer = useCallback(
    (notify = false) => {
      if (notify && socket?.connected && safeRequestId && safeReceiverId) {
        socket.emit("ambulance:call-ended", {
          requestId: safeRequestId,
          receiverId: safeReceiverId,
        });
      }

      if (peerRef.current) {
        peerRef.current.ontrack = null;
        peerRef.current.onicecandidate = null;
        peerRef.current.onconnectionstatechange = null;
        peerRef.current.close();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        localStreamRef.current = null;
      }

      pendingCandidatesRef.current = [];

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
      }

      if (mountedRef.current) {
        setCallState("idle");
        setIncomingCall(null);
        setMuted(false);
        setDuration(0);
        setError("");
      }
    },
    [safeReceiverId, safeRequestId, socket]
  );

  const createPeer = useCallback(
    async (targetId) => {
      if (!socket || !safeRequestId || !targetId) {
        throw new Error("Call connection is unavailable.");
      }

      if (peerRef.current) {
        return peerRef.current;
      }

      const peer = new RTCPeerConnection(
        ICE_SERVERS
      );

      peerRef.current = peer;

      peer.onicecandidate = (event) => {
        if (!event.candidate) {
          return;
        }

        socket.emit("ambulance:ice-candidate", {
          requestId: safeRequestId,
          receiverId: String(targetId),
          candidate: event.candidate,
        });
      };

      peer.ontrack = (event) => {
        const stream = event.streams?.[0];

        if (!stream || !remoteAudioRef.current) {
          return;
        }

        remoteAudioRef.current.srcObject = stream;

        remoteAudioRef.current
          .play()
          .catch(() => {
            console.log(
              "Remote audio waiting for user interaction."
            );
          });
      };

      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;

        console.log(
          "Ambulance WebRTC connection:",
          state
        );

        if (state === "connected") {
          setCallState("connected");
        }

        if (
          state === "failed" ||
          state === "disconnected" ||
          state === "closed"
        ) {
          cleanupPeer(false);
        }
      };

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      return peer;
    },
    [
      cleanupPeer,
      safeRequestId,
      socket,
    ]
  );

  const startCall = async () => {
    if (
      disabled ||
      callState !== "idle" ||
      !safeRequestId ||
      !safeReceiverId
    ) {
      return;
    }

    if (!socket?.connected) {
      setError(
        "Calling connection is not available."
      );
      return;
    }

    try {
      setError("");
      setCallState("calling");

      const peer = await createPeer(
        safeReceiverId
      );

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(offer);

      socket.emit("ambulance:call-offer", {
        requestId: safeRequestId,
        receiverId: safeReceiverId,
        callType: "audio",
        offer,
      });
    } catch (err) {
      console.error(
        "Start ambulance call error:",
        err
      );

      cleanupPeer(false);

      setError(
        err.message ||
          "Unable to start the call."
      );
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) {
      return;
    }

    try {
      setError("");
      setCallState("connecting");

      const callerId =
        incomingCall.callerId;

      const peer = await createPeer(
        callerId
      );

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          incomingCall.offer
        )
      );

      for (const candidate of pendingCandidatesRef.current) {
        try {
          await peer.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.error(
            "Pending ICE candidate error:",
            error
          );
        }
      }

      pendingCandidatesRef.current = [];

      const answer =
        await peer.createAnswer();

      await peer.setLocalDescription(
        answer
      );

      socket.emit("ambulance:call-answer", {
        requestId: safeRequestId,
        receiverId: callerId,
        answer,
      });

      setIncomingCall(null);
    } catch (err) {
      console.error(
        "Accept ambulance call error:",
        err
      );

      cleanupPeer(false);

      setError(
        err.message ||
          "Unable to accept the call."
      );
    }
  };

  const rejectCall = () => {
    if (!incomingCall || !socket) {
      return;
    }

    socket.emit("ambulance:call-rejected", {
      requestId: safeRequestId,
      receiverId: incomingCall.callerId,
    });

    setIncomingCall(null);
  };

  const endCall = () => {
    cleanupPeer(true);
  };

  const toggleMute = () => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    const nextMuted = !muted;

    stream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = !nextMuted;
      });

    setMuted(nextMuted);
  };

  const toggleSpeaker = () => {
    const nextSpeaker = !speaker;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !nextSpeaker;
    }

    setSpeaker(nextSpeaker);
  };




  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        localStreamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !safeRequestId) {
      return;
    }

    const handleOffer = async (data) => {
      if (
        String(data?.requestId) !==
        safeRequestId
      ) {
        return;
      }

      if (!data?.offer) {
        return;
      }

      const callerId =
        data?.callerId ||
        data?.senderId;

      if (!callerId) {
        return;
      }

      if (
        String(callerId) ===
        getCurrentUserId()
      ) {
        return;
      }

      if (callState !== "idle") {
        socket.emit(
          "ambulance:call-busy",
          {
            requestId: safeRequestId,
            receiverId: callerId,
          }
        );

        return;
      }

      setIncomingCall({
        callerId: String(callerId),
        offer: data.offer,
        callType: "audio",
      });
    };

    const handleAnswer = async (data) => {
      if (
        String(data?.requestId) !==
        safeRequestId
      ) {
        return;
      }

      if (!data?.answer || !peerRef.current) {
        return;
      }

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(
            data.answer
          )
        );

        setCallState("connected");

        for (const candidate of pendingCandidatesRef.current) {
          try {
            await peerRef.current.addIceCandidate(
              new RTCIceCandidate(candidate)
            );
          } catch (error) {
            console.error(
              "ICE candidate error:",
              error
            );
          }
        }

        pendingCandidatesRef.current = [];
      } catch (error) {
        console.error(
          "Set remote answer error:",
          error
        );

        setError(
          "Unable to connect the call."
        );
      }
    };

    const handleIceCandidate = async (
      data
    ) => {
      if (
        String(data?.requestId) !==
        safeRequestId
      ) {
        return;
      }

      if (!data?.candidate) {
        return;
      }

      if (!peerRef.current) {
        pendingCandidatesRef.current.push(
          data.candidate
        );

        return;
      }

      try {
        if (
          peerRef.current.remoteDescription
        ) {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(
              data.candidate
            )
          );
        } else {
          pendingCandidatesRef.current.push(
            data.candidate
          );
        }
      } catch (error) {
        console.error(
          "ICE candidate receive error:",
          error
        );
      }
    };

    const handleCallEnded = (data) => {
      if (
        String(data?.requestId) !==
        safeRequestId
      ) {
        return;
      }

      cleanupPeer(false);
    };

    const handleCallRejected = (data) => {
      if (
        String(data?.requestId) !==
        safeRequestId
      ) {
        return;
      }

      cleanupPeer(false);

      setError("Call was rejected.");
    };

    const handleCallBusy = (data) => {
      if (
        String(data?.requestId) !==
        safeRequestId
      ) {
        return;
      }

      cleanupPeer(false);

      setError(
        "The other person is already on another call."
      );
    };

    socket.on(
      "ambulance:call-offer",
      handleOffer
    );

    socket.on(
      "ambulance:call-answer",
      handleAnswer
    );

    socket.on(
      "ambulance:ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "ambulance:call-ended",
      handleCallEnded
    );

    socket.on(
      "ambulance:call-rejected",
      handleCallRejected
    );

    socket.on(
      "ambulance:call-busy",
      handleCallBusy
    );

    return () => {
      socket.off(
        "ambulance:call-offer",
        handleOffer
      );

      socket.off(
        "ambulance:call-answer",
        handleAnswer
      );

      socket.off(
        "ambulance:ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "ambulance:call-ended",
        handleCallEnded
      );

      socket.off(
        "ambulance:call-rejected",
        handleCallRejected
      );

      socket.off(
        "ambulance:call-busy",
        handleCallBusy
      );
    };
  }, [
    callState,
    cleanupPeer,
    safeRequestId,
    socket,
  ]);

  useEffect(() => {
    if (
      !socket ||
      !safeRequestId ||
      !incomingCall
    ) {
      return;
    }

    /*
     * Nothing else is required here.
     * The incoming-call UI waits for the
     * user to accept or reject.
     */
  }, [
    incomingCall,
    safeRequestId,
    socket,
  ]);

  useEffect(() => {
    if (callState !== "connected") {
      return undefined;
    }

    const timer = setInterval(() => {
      setDuration((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  if (!safeRequestId) {
    return null;
  }

  return (
    <>
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      {callState === "idle" && !incomingCall && (
        <div className="mt-4 w-full">
          <button
            type="button"
            onClick={startCall}
            disabled={disabled || !safeReceiverId}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CallIcon type="phone" size={20} />
            Call {receiverName}
          </button>
          {error && (
            <p className="mt-2 text-center text-xs text-red-400">
              {error}
            </p>
          )}
        </div>
      )}

      {incomingCall && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-cyan-400/20 bg-slate-900 p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
              <CallIcon
                type="phone"
                size={32}
              />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-cyan-400">
              Incoming Call
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {role === "patient"
                ? "Ambulance Driver"
                : "Patient"}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Incoming emergency voice call
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={rejectCall}
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-400/20"
              >
                Reject
              </button>

              <button
                type="button"
                onClick={acceptCall}
                className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {callState !== "idle" &&
        !incomingCall && (
          <div className="fixed bottom-5 left-1/2 z-9998 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-xl">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                  <CallIcon
                    type="phone"
                    size={25}
                  />
                </div>

                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  {callState === "calling"
                    ? "Calling..."
                    : callState === "connecting"
                      ? "Connecting..."
                      : "Call Connected"}
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  {receiverName}
                </h3>

                {callState ===
                  "connected" && (
                  <p className="mt-1 text-sm font-mono text-slate-400">
                    {formatDuration(
                      duration
                    )}
                  </p>
                )}
              </div>

              {error && (
                <p className="mt-3 text-center text-xs text-red-400">
                  {error}
                </p>
              )}

              {callState ===
                "connected" && (
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                      muted
                        ? "border-red-400/30 bg-red-400/20 text-red-300"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                    title={
                      muted
                        ? "Unmute"
                        : "Mute"
                    }
                  >
                    <CallIcon
                      type="mic"
                      size={21}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={toggleSpeaker}
                    className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                      speaker
                        ? "border-cyan-400/30 bg-cyan-400/20 text-cyan-300"
                        : "border-white/10 bg-white/5 text-slate-400"
                    }`}
                    title="Speaker"
                  >
                    <CallIcon
                      type="speaker"
                      size={21}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={endCall}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-400"
                    title="End call"
                  >
                    <CallIcon
                      type="phone"
                      size={24}
                    />
                  </button>
                </div>
              )}

              {callState !==
                "connected" && (
                <button
                  type="button"
                  onClick={endCall}
                  className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-400"
                  title="Cancel"
                >
                  <CallIcon
                    type="phone"
                    size={21}
                  />
                </button>
              )}
            </div>
          </div>
        )}
    </>
  );
}