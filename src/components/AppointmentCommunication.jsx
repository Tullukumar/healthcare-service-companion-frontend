import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { io } from "socket.io-client";

function AppointmentCommunication({
  appointment,
}) {
  // ==========================================
  // STATE
  // ==========================================

  const [chatOpen, setChatOpen] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [callType, setCallType] =
    useState("");

  const [callError, setCallError] =
    useState("");

  const [incomingCall, setIncomingCall] =
    useState(null);

  // CALL CONTROLS
  const [isMicMuted, setIsMicMuted] =
    useState(false);

  const [isCameraOff, setIsCameraOff] =
    useState(false);

  const [isSpeakerMuted, setIsSpeakerMuted] =
    useState(false);

  // CALL STATUS / TIMER
  const [callStatus, setCallStatus] =
    useState("idle");

  const [callDuration, setCallDuration] =
    useState(0);

  // ==========================================
  // REFS
  // ==========================================

  const socketRef =
    useRef(null);

  const peerRef =
    useRef(null);

  const localStreamRef =
    useRef(null);

  const localVideoRef =
    useRef(null);

  const remoteVideoRef =
    useRef(null);

  /*
   * ICE candidates can arrive before
   * remoteDescription is ready.
   */
  const pendingIceCandidatesRef =
    useRef([]);

  // ==========================================
  // USER
  // ==========================================

  const token =
    localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") ||
        "null"
    );
  } catch {
    user = null;
  }

  const isDoctor =
    user?.role === "doctor";

  const appointmentId =
    appointment?._id
      ? String(appointment._id)
      : "";

  // ==========================================
  // CALL TIMER
  // ==========================================

  useEffect(() => {
    if (callStatus !== "connected") {
      return undefined;
    }

    const timer = setInterval(() => {
      setCallDuration((previous) => previous + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [callStatus]);

  // ==========================================
  // FORMAT CALL DURATION
  // ==========================================

  const formatCallDuration = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  };

  // ==========================================
  // RESET CALL CONTROLS
  // ==========================================

  const resetCallControls =
    useCallback(() => {
      setIsMicMuted(false);
      setIsCameraOff(false);
      setIsSpeakerMuted(false);
    }, []);

  // ==========================================
  // CLEANUP CALL
  // ==========================================

  const cleanupCall =
    useCallback(() => {
      console.log(
        "🧹 Cleaning WebRTC call"
      );

      // Close peer connection
      if (peerRef.current) {
        try {
          peerRef.current.onicecandidate =
            null;

          peerRef.current.ontrack =
            null;

          peerRef.current.close();
        } catch (error) {
          console.error(
            "Peer cleanup error:",
            error
          );
        }

        peerRef.current = null;
      }

      // Stop local media tracks
      if (localStreamRef.current) {
        localStreamRef.current
          .getTracks()
          .forEach((track) => {
            try {
              track.stop();
            } catch (error) {
              console.error(
                "Track cleanup error:",
                error
              );
            }
          });

        localStreamRef.current = null;
      }

      // Clear local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          null;
      }

      // Clear remote media
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          null;
      }

      // Clear queued ICE
      pendingIceCandidatesRef.current =
        [];

      // Reset controls
      resetCallControls();

      setCallType("");
      setCallStatus("idle");
      setCallDuration(0);
    }, [resetCallControls]);

  // ==========================================
  // CREATE PEER CONNECTION
  // ==========================================

  const createPeerConnection =
    useCallback(() => {
      if (peerRef.current) {
        return peerRef.current;
      }

      const peer =
        new RTCPeerConnection({
          iceServers: [
            {
              urls:
                "stun:stun.l.google.com:19302",
            },
          ],
        });

      // ========================================
      // ICE CANDIDATE
      // ========================================

      peer.onicecandidate = (
        event
      ) => {
        if (
          !event.candidate ||
          !socketRef.current?.connected ||
          !appointmentId
        ) {
          return;
        }

        console.log(
          "📡 Sending ICE candidate"
        );

        socketRef.current.emit(
          "appointment:ice-candidate",
          {
            appointmentId,
            candidate:
              event.candidate,
          }
        );
      };

      // ========================================
      // REMOTE TRACK
      // ========================================

      peer.ontrack = (event) => {
        console.log(
          "🎧 Remote track received"
        );

        const remoteStream =
          event.streams?.[0];

        if (
          remoteStream &&
          remoteVideoRef.current
        ) {
          remoteVideoRef.current.srcObject =
            remoteStream;

          

          const playPromise =
            remoteVideoRef.current.play?.();

          if (
            playPromise?.catch
          ) {
            playPromise.catch(
              (error) => {
                console.log(
                  "Remote media autoplay:",
                  error
                );
              }
            );
          }
        }
      };

      // ========================================
      // CONNECTION STATE
      // ========================================

      peer.onconnectionstatechange =
        () => {
          console.log(
            "📡 WebRTC connection:",
            peer.connectionState
          );

          if (
            peer.connectionState ===
            "connected"
          ) {
            setCallStatus("connected");
          } else if (
            peer.connectionState ===
              "connecting" ||
            peer.connectionState ===
              "new"
          ) {
            setCallStatus((previous) =>
              previous === "calling"
                ? previous
                : "connecting"
            );
          }

          if (
            peer.connectionState ===
              "failed" ||
            peer.connectionState ===
              "disconnected"
          ) {
            console.log(
              "⚠️ WebRTC connection lost"
            );
          }
        };
        peerRef.current = peer;

return peer;
}, [
  appointmentId,
  
]);


  // ==========================================
  // START CALL
  // ==========================================

  const startCall = async (
    type
  ) => {
    try {
      setCallError("");

      if (!appointmentId) {
        setCallError(
          "Appointment information is unavailable."
        );

        return;
      }

      if (
        !socketRef.current ||
        !socketRef.current.connected
      ) {
        setCallError(
          "Communication connection is not ready."
        );

        return;
      }

      console.log(
        `📞 Starting ${type} call`
      );

      cleanupCall();

      setCallType(type);
      setCallStatus("calling");
      setCallDuration(0);

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
            video:
              type === "video",
          }
        );

      localStreamRef.current =
        stream;

      // ========================================
      // LOCAL VIDEO
      // ========================================

      if (
        localVideoRef.current
      ) {
        localVideoRef.current.srcObject =
          stream;

        try {
          await localVideoRef.current.play();
        } catch {
          // Browser autoplay restriction.
        }
      }

      // ========================================
      // CREATE PEER
      // ========================================

      const peer =
        createPeerConnection();

      stream
        .getTracks()
        .forEach((track) => {
          peer.addTrack(
            track,
            stream
          );
        });

      // ========================================
      // CREATE OFFER
      // ========================================

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      console.log(
        "📞 Call offer sent"
      );

      socketRef.current.emit(
        "appointment:call-offer",
        {
          appointmentId,

          callType: type,

          offer,
        }
      );
    } catch (error) {
      console.error(
        "❌ Start call error:",
        error
      );

      cleanupCall();

      if (
        error?.name ===
        "NotAllowedError"
      ) {
        setCallError(
          "Camera/microphone permission was denied. Please allow access and try again."
        );
      } else if (
        error?.name ===
        "NotFoundError"
      ) {
        setCallError(
          "No microphone or camera was found."
        );
      } else {
        setCallError(
          error?.message ||
            "Unable to start the call."
        );
      }
    }
  };

  // ==========================================
  // ACCEPT INCOMING CALL
  // ==========================================

  const acceptIncomingCall =
    async () => {
      if (!incomingCall) {
        return;
      }

      try {
        if (
          !socketRef.current ||
          !socketRef.current.connected
        ) {
          setCallError(
            "Communication connection is not available."
          );

          return;
        }

        const type =
          incomingCall.callType ||
          "audio";

        const offer =
          incomingCall.offer;

        if (!offer) {
          setCallError(
            "Call offer is missing."
          );

          setIncomingCall(null);

          return;
        }

        console.log(
          `📞 Accepting ${type} call`
        );

        setCallError("");

        setCallType(type);
        setCallStatus("connecting");
        setCallDuration(0);

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
              video:
                type === "video",
            }
          );

        localStreamRef.current =
          stream;

        // ======================================
        // LOCAL VIDEO
        // ======================================

        if (
          localVideoRef.current
        ) {
          localVideoRef.current.srcObject =
            stream;

          try {
            await localVideoRef.current.play();
          } catch {
            // Browser autoplay restriction.
          }
        }

        // ======================================
        // CREATE PEER
        // ======================================

        const peer =
          createPeerConnection();

        stream
          .getTracks()
          .forEach((track) => {
            peer.addTrack(
              track,
              stream
            );
          });

        // ======================================
        // SET REMOTE DESCRIPTION FIRST
        // ======================================

        await peer.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        console.log(
          "✅ Remote description set"
        );

        // ======================================
        // ADD QUEUED ICE
        // ======================================

        const queuedCandidates =
          pendingIceCandidatesRef.current;

        pendingIceCandidatesRef.current =
          [];

        for (
          const candidate of
          queuedCandidates
        ) {
          try {
            await peer.addIceCandidate(
              candidate
            );

            console.log(
              "✅ Queued ICE candidate added"
            );
          } catch (error) {
            console.error(
              "❌ Queued ICE candidate error:",
              error
            );
          }
        }

        // ======================================
        // CREATE ANSWER
        // ======================================

        const answer =
          await peer.createAnswer();

        await peer.setLocalDescription(
          answer
        );

        // ======================================
        // SEND ANSWER
        // ======================================

        socketRef.current.emit(
          "appointment:call-answer",
          {
            appointmentId,
            answer,
          }
        );

        console.log(
          "📞 Call answer sent"
        );

        setIncomingCall(null);
      } catch (error) {
        console.error(
          "❌ Accept call error:",
          error
        );

        setIncomingCall(null);

        cleanupCall();

        if (
          error?.name ===
          "NotAllowedError"
        ) {
          setCallError(
            "Microphone/camera permission was denied."
          );
        } else {
          setCallError(
            error?.message ||
              "Unable to answer the call."
          );
        }
      }
    };

  // ==========================================
  // REJECT CALL
  // ==========================================

  const rejectIncomingCall =
    () => {
      console.log(
        "📴 Incoming call rejected"
      );

      setIncomingCall(null);

      pendingIceCandidatesRef.current =
        [];

      if (
        socketRef.current?.connected &&
        appointmentId
      ) {
        socketRef.current.emit(
          "appointment:call-ended",
          {
            appointmentId,
          }
        );
      }
    };

  // ==========================================
  // MUTE / UNMUTE MICROPHONE
  // ==========================================

  const toggleMicrophone =
    () => {
      const stream =
        localStreamRef.current;

      if (!stream) {
        return;
      }

      const audioTracks =
        stream.getAudioTracks();

      if (
        audioTracks.length ===
        0
      ) {
        return;
      }

      const nextMuted =
        !isMicMuted;

      audioTracks.forEach(
        (track) => {
          track.enabled =
            !nextMuted;
        }
      );

      setIsMicMuted(
        nextMuted
      );

      console.log(
        nextMuted
          ? "🎤 Microphone muted"
          : "🎤 Microphone unmuted"
      );
    };

  // ==========================================
  // CAMERA ON / OFF
  // ==========================================

  const toggleCamera =
    () => {
      if (
        callType !== "video"
      ) {
        return;
      }

      const stream =
        localStreamRef.current;

      if (!stream) {
        return;
      }

      const videoTracks =
        stream.getVideoTracks();

      if (
        videoTracks.length ===
        0
      ) {
        return;
      }

      const nextCameraOff =
        !isCameraOff;

      videoTracks.forEach(
        (track) => {
          track.enabled =
            !nextCameraOff;
        }
      );

      setIsCameraOff(
        nextCameraOff
      );

      console.log(
        nextCameraOff
          ? "📹 Camera turned off"
          : "📹 Camera turned on"
      );
    };

  // ==========================================
  // SPEAKER ON / OFF
  // ==========================================

  const toggleSpeaker =
    () => {
      const mediaElement =
        remoteVideoRef.current;

      if (!mediaElement) {
        return;
      }

      const nextSpeakerMuted =
        !isSpeakerMuted;

      /*
       * For a browser application,
       * "speaker off" is implemented
       * by muting the remote audio.
       *
       * A normal browser cannot force
       * hardware speakerphone routing
       * like a native Android/iOS app.
       */

      mediaElement.muted =
        nextSpeakerMuted;

      if (
        !nextSpeakerMuted
      ) {
        mediaElement.volume = 1;
      }

      setIsSpeakerMuted(
        nextSpeakerMuted
      );

      console.log(
        nextSpeakerMuted
          ? "🔇 Speaker muted"
          : "🔊 Speaker enabled"
      );
    };

  // ==========================================
  // SOCKET CONNECTION
  // ==========================================

  useEffect(() => {
    if (
      !token ||
      !appointmentId ||
      appointment?.status !==
        "confirmed"
    ) {
      return;
    }

    console.log(
      "🔌 Creating appointment socket..."
    );

  const socket = io(
  "http://localhost:5000",
  {
        auth: {
          token,
        },

        transports: [
          "polling",
          "websocket",
        ],

        withCredentials: true,

        reconnection: true,

        reconnectionAttempts: 10,

        reconnectionDelay: 1000,

        timeout: 20000,
      }
    );

    socketRef.current =
      socket;

    // ========================================
    // CONNECT
    // ========================================

    const handleConnect = () => {
      console.log(
        "🔌 Appointment socket connected:",
        socket.id
      );

      socket.emit(
        "appointment:join",
        {
          appointmentId,
        }
      );

      console.log(
        "📅 Joined appointment:",
        appointmentId
      );
    };

    socket.on(
      "connect",
      handleConnect
    );

    // ========================================
    // CHAT MESSAGE
    // ========================================

    const handleChatMessage =
      (incoming) => {
        console.log(
          "📩 Appointment message received:",
          incoming
        );

        if (
          !incoming ||
          String(
            incoming.appointmentId
          ) !==
            String(appointmentId)
        ) {
          return;
        }

        if (
          !incoming.senderId ||
          !incoming.text
        ) {
          return;
        }

        setMessages(
          (previousMessages) => {
            // ==================================
            // MESSAGE ID DUPLICATE CHECK
            // ==================================

            if (
              incoming.messageId
            ) {
              const exists =
                previousMessages.some(
                  (item) =>
                    item.messageId ===
                    incoming.messageId
                );

              if (exists) {
                console.log(
                  "⚠️ Duplicate message ignored"
                );

                return previousMessages;
              }
            }

            // ==================================
            // FALLBACK DUPLICATE CHECK
            // ==================================

            const incomingTime =
              incoming.createdAt ||
              incoming.timestamp ||
              "";

            const duplicate =
              previousMessages.some(
                (item) => {
                  const itemTime =
                    item.createdAt ||
                    item.timestamp ||
                    "";

                  return (
                    String(
                      item.appointmentId
                    ) ===
                      String(
                        incoming.appointmentId
                      ) &&
                    String(
                      item.senderId
                    ) ===
                      String(
                        incoming.senderId
                      ) &&
                    item.senderRole ===
                      incoming.senderRole &&
                    item.text ===
                      incoming.text &&
                    itemTime ===
                      incomingTime
                  );
                }
              );

            if (duplicate) {
              console.log(
                "⚠️ Duplicate message ignored"
              );

              return previousMessages;
            }

            return [
              ...previousMessages,
              incoming,
            ];
          }
        );
      };

    socket.on(
      "appointment:chat-message",
      handleChatMessage
    );

    // ========================================
    // INCOMING CALL
    // ========================================

    const handleCallOffer =
      (data) => {
        try {
          if (
            String(
              data?.appointmentId
            ) !==
            String(appointmentId)
          ) {
            return;
          }

          if (!data?.offer) {
            return;
          }

          console.log(
            "📞 Incoming call:",
            data.callType
          );

          /*
           * Do NOT use window.confirm().
           * React popup is used instead.
           */

          setIncomingCall({
            callType:
              data.callType ||
              "audio",

            offer:
              data.offer,
          });
        } catch (error) {
          console.error(
            "Incoming call error:",
            error
          );
        }
      };

    socket.on(
      "appointment:call-offer",
      handleCallOffer
    );

    // ========================================
    // CALL ANSWER
    // ========================================

    const handleCallAnswer =
      async (data) => {
        try {
          if (
            String(
              data?.appointmentId
            ) !==
            String(appointmentId)
          ) {
            return;
          }

          if (
            !data?.answer
          ) {
            return;
          }

          if (
            !peerRef.current
          ) {
            console.log(
              "⚠️ Peer connection unavailable"
            );

            return;
          }

          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(
              data.answer
            )
          );

          setCallStatus("connecting");

          console.log(
            "✅ Call answer received"
          );

          // ====================================
          // ADD QUEUED ICE
          // ====================================

          const queuedCandidates =
            pendingIceCandidatesRef.current;

          pendingIceCandidatesRef.current =
            [];

          for (
            const candidate of
            queuedCandidates
          ) {
            try {
              await peerRef.current.addIceCandidate(
                candidate
              );

              console.log(
                "✅ Queued ICE candidate added"
              );
            } catch (error) {
              console.error(
                "❌ Queued ICE candidate error:",
                error
              );
            }
          }
        } catch (error) {
          console.error(
            "❌ Call answer error:",
            error
          );
        }
      };

    socket.on(
      "appointment:call-answer",
      handleCallAnswer
    );

    // ========================================
    // ICE CANDIDATE
    // ========================================

    const handleIceCandidate =
      async (data) => {
        try {
          if (
            String(
              data?.appointmentId
            ) !==
            String(appointmentId)
          ) {
            return;
          }

          if (!data?.candidate) {
            return;
          }

          const candidate =
            new RTCIceCandidate(
              data.candidate
            );

          /*
           * ICE can arrive before
           * remoteDescription.
           */

          if (
            !peerRef.current ||
            !peerRef.current
              .remoteDescription
          ) {
            pendingIceCandidatesRef.current.push(
              candidate
            );

            console.log(
              "⏳ ICE candidate queued"
            );

            return;
          }

          await peerRef.current.addIceCandidate(
            candidate
          );

          console.log(
            "✅ ICE candidate added"
          );
        } catch (error) {
          console.error(
            "❌ ICE candidate error:",
            error
          );
        }
      };

    socket.on(
      "appointment:ice-candidate",
      handleIceCandidate
    );

    // ========================================
    // CALL ENDED
    // ========================================

    const handleCallEnded =
      (data) => {
        if (
          data?.appointmentId &&
          String(
            data.appointmentId
          ) !==
            String(appointmentId)
        ) {
          return;
        }

        console.log(
          "📴 Remote call ended"
        );

        setIncomingCall(null);

        cleanupCall();
      };

    socket.on(
      "appointment:call-ended",
      handleCallEnded
    );

    // ========================================
    // COMMUNICATION ERROR
    // ========================================

    const handleCommunicationError =
      (data) => {
        console.error(
          "❌ Communication error:",
          data
        );

        setCallError(
          data?.message ||
            "Communication error."
        );
      };

    socket.on(
      "appointment:communication-error",
      handleCommunicationError
    );

    // ========================================
    // CONNECT ERROR
    // ========================================

    const handleConnectError =
      (error) => {
        console.error(
          "❌ Appointment socket error:",
          error
        );
      };

    socket.on(
      "connect_error",
      handleConnectError
    );

    // ========================================
    // DISCONNECT
    // ========================================

    const handleDisconnect =
      (reason) => {
        console.log(
          "🔌 Appointment socket disconnected:",
          reason
        );
      };

    socket.on(
      "disconnect",
      handleDisconnect
    );

    // ========================================
    // CLEANUP
    // ========================================

    return () => {
      console.log(
        "🧹 Cleaning appointment socket"
      );

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "appointment:chat-message",
        handleChatMessage
      );

      socket.off(
        "appointment:call-offer",
        handleCallOffer
      );

      socket.off(
        "appointment:call-answer",
        handleCallAnswer
      );

      socket.off(
        "appointment:ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "appointment:call-ended",
        handleCallEnded
      );

      socket.off(
        "appointment:communication-error",
        handleCommunicationError
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      if (
        socket.connected
      ) {
        socket.emit(
          "appointment:leave",
          {
            appointmentId,
          }
        );
      }

      socket.disconnect();

      if (
        socketRef.current ===
        socket
      ) {
        socketRef.current =
          null;
      }

      setIncomingCall(null);

      pendingIceCandidatesRef.current =
        [];

      cleanupCall();
    };
  }, [
    appointmentId,
    appointment?.status,
    token,
    cleanupCall,
    createPeerConnection,
  ]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = () => {
    const text =
      message.trim();

    if (!text) {
      return;
    }

    if (
      !socketRef.current ||
      !socketRef.current.connected
    ) {
      setCallError(
        "Communication connection is not ready."
      );

      return;
    }

    if (!appointmentId) {
      setCallError(
        "Appointment information is unavailable."
      );

      return;
    }

    const senderId =
      user?._id ||
      user?.id;

    const senderRole =
      user?.role;

    if (!senderId) {
      setCallError(
        "Unable to identify the current user."
      );

      return;
    }

    if (
      senderRole !== "doctor" &&
      senderRole !== "patient"
    ) {
      setCallError(
        "Invalid user role."
      );

      return;
    }

    const messageId =
      `${appointmentId}-${senderId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const createdAt =
      new Date().toISOString();

    const outgoingMessage = {
      messageId,

      appointmentId,

      senderId:
        String(senderId),

      senderRole,

      text,

      createdAt,

      timestamp:
        createdAt,
    };

    console.log(
      "📤 Sending appointment message:",
      outgoingMessage
    );

    socketRef.current.emit(
      "appointment:chat-message",
      outgoingMessage
    );

    setMessages(
      (previousMessages) => {
        const exists =
          previousMessages.some(
            (item) =>
              item.messageId ===
              messageId
          );

        if (exists) {
          return previousMessages;
        }

        return [
          ...previousMessages,
          outgoingMessage,
        ];
      }
    );

    setMessage("");
  };

  // ==========================================
  // END CALL
  // ==========================================

  const endCall = () => {
    console.log(
      "📴 Ending call"
    );

    if (
      socketRef.current?.connected &&
      appointmentId
    ) {
      socketRef.current.emit(
        "appointment:call-ended",
        {
          appointmentId,
        }
      );
    }

    setIncomingCall(null);

    pendingIceCandidatesRef.current =
      [];

    cleanupCall();
  };

  // ==========================================
  // INVALID APPOINTMENT
  // ==========================================

  if (
    !appointment ||
    appointment.status !==
      "confirmed"
  ) {
    return null;
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mt-6 border-t border-white/10 pt-6">

      {/* ======================================
          INCOMING CALL POPUP
      ====================================== */}

      {incomingCall && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl">

            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
              📞
            </div>

            <h2 className="text-xl font-bold text-white">
              Incoming{" "}
              {incomingCall.callType ===
              "video"
                ? "Video"
                : "Audio"}{" "}
              Call
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {isDoctor
                ? "Patient is calling you"
                : "Doctor is calling you"}
            </p>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={
                  rejectIncomingCall
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white transition hover:bg-red-500"
              >
                Decline
              </button>

              <button
                type="button"
                onClick={
                  acceptIncomingCall
                }
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-500"
              >
                Accept
              </button>

            </div>
          </div>
        </div>
      )}

      {/* ======================================
          MAIN BUTTONS
      ====================================== */}

      <div className="flex flex-wrap gap-3">

        {/* CHAT */}

        <button
          type="button"
          onClick={() =>
            setChatOpen(
              (value) => !value
            )
          }
          className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-400 transition hover:bg-blue-500/20"
        >
          💬
          <span>Chat</span>
        </button>

        {/* AUDIO CALL */}

        <button
          type="button"
          onClick={() =>
            startCall("audio")
          }
          disabled={Boolean(callType)}
          className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          📞
          <span>Call</span>
        </button>

        {/* VIDEO CALL */}

        <button
          type="button"
          onClick={() =>
            startCall("video")
          }
          disabled={Boolean(callType)}
          className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-bold text-cyan-400 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          📹
          <span>Video Call</span>
        </button>

      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {callError && (
        <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {callError}
        </p>
      )}

      {/* ======================================
          CHAT
      ====================================== */}

      {chatOpen && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">

          <div className="max-h-64 space-y-3 overflow-y-auto p-4">

            {messages.length ===
            0 ? (
              <p className="text-center text-sm text-slate-600">
                No messages yet.
                Start the conversation.
              </p>
            ) : (
              messages.map(
                (
                  item,
                  index
                ) => {
                  const mine =
                    String(
                      item.senderId
                    ) ===
                    String(
                      user?._id ||
                        user?.id
                    );

                  return (
                    <div
                      key={
                        item.messageId ||
                        `${item.timestamp || item.createdAt}-${item.senderId}-${index}`
                      }
                      className={`flex ${
                        mine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-full rounded-2xl px-4 py-2.5 text-sm ${
                          mine
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 text-slate-300"
                        }`}
                      >
                        {
                          item.text
                        }
                      </div>
                    </div>
                  );
                }
              )
            )}

          </div>

          <div className="flex gap-2 border-t border-white/10 p-3">

            <input
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  event.preventDefault();

                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
            />

            <button
              type="button"
              onClick={
                sendMessage
              }
              disabled={
                !message.trim()
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>

          </div>
        </div>
      )}

      {/* ======================================
          ACTIVE CALL
      ====================================== */}

      {callType && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-4">

          {/* ==================================
              CALL HEADER
          ================================== */}

          <div className="flex items-center justify-between gap-3">

            <div>
              <p className="text-sm font-bold text-white">
                {callType ===
                "video"
                  ? "Video consultation"
                  : "Voice consultation"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Secure peer-to-peer
                call
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    callStatus === "connected"
                      ? "bg-emerald-400"
                      : callStatus === "calling"
                      ? "bg-amber-400 animate-pulse"
                      : "bg-cyan-400 animate-pulse"
                  }`}
                />
                <span className="text-xs font-semibold text-slate-300">
                  {callStatus === "calling"
                    ? "Calling..."
                    : callStatus === "connecting"
                    ? "Connecting..."
                    : callStatus === "connected"
                    ? "Connected"
                    : "Ready"}
                </span>
              </div>

              {callStatus === "connected" && (
                <span className="font-mono text-xs text-slate-500">
                  {formatCallDuration(callDuration)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={
                endCall
              }
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-500"
            >
              📞 End Call
            </button>

          </div>

          {/* ==================================
              VIDEO AREA
          ================================== */}

          {callType ===
            "video" && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <div className="relative overflow-hidden rounded-2xl bg-black">

                <video
                  ref={
                    localVideoRef
                  }
                  autoPlay
                  muted
                  playsInline
                  className="min-h-48 w-full object-cover"
                />

                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">

                    <div className="text-center">

                      <div className="text-4xl">
                        📹
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-400">
                        Camera Off
                      </p>

                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                  You
                </div>

              </div>

              <div className="relative overflow-hidden rounded-2xl bg-black">

                <video
                  ref={
                    remoteVideoRef
                  }
                  autoPlay
                  playsInline
                  className="min-h-48 w-full object-cover"
                />

                <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                  {isDoctor
                    ? "Patient"
                    : "Doctor"}
                </div>

              </div>

            </div>
          )}

          {/* ==================================
              AUDIO REMOTE
          ================================== */}

          {callType ===
            "audio" && (
            <div className="mt-4">

              <audio
                ref={
                  remoteVideoRef
                }
                autoPlay
                playsInline
                muted={
                  isSpeakerMuted
                }
                className="hidden"
              />

              <div className="flex min-h-40 items-center justify-center rounded-2xl bg-slate-900">

                <div className="text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-4xl">
                    👤
                  </div>

                  <p className="mt-3 text-sm font-bold text-white">
                    {isDoctor
                      ? "Patient"
                      : "Doctor"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Voice call in
                    progress
                  </p>

                </div>

              </div>

            </div>
          )}

          {/* ==================================
              CALL CONTROLS
          ================================== */}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">

            {/* MICROPHONE */}

            <button
              type="button"
              onClick={
                toggleMicrophone
              }
              title={
                isMicMuted
                  ? "Unmute microphone"
                  : "Mute microphone"
              }
              className={`flex min-w-24 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                isMicMuted
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isMicMuted
                ? "🔇"
                : "🎤"}

              <span>
                {isMicMuted
                  ? "Unmute"
                  : "Mute"}
              </span>
            </button>

            {/* CAMERA */}

            {callType ===
              "video" && (
              <button
                type="button"
                onClick={
                  toggleCamera
                }
                title={
                  isCameraOff
                    ? "Turn camera on"
                    : "Turn camera off"
                }
                className={`flex min-w-24 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isCameraOff
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {isCameraOff
                  ? "📹"
                  : "📷"}

                <span>
                  {isCameraOff
                    ? "Camera On"
                    : "Camera Off"}
                </span>
              </button>
            )}

            {/* SPEAKER */}

            <button
              type="button"
              onClick={
                toggleSpeaker
              }
              title={
                isSpeakerMuted
                  ? "Turn speaker on"
                  : "Turn speaker off"
              }
              className={`flex min-w-24 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                isSpeakerMuted
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {isSpeakerMuted
                ? "🔇"
                : "🔊"}

              <span>
                {isSpeakerMuted
                  ? "Speaker Off"
                  : "Speaker On"}
              </span>
            </button>

            {/* END CALL */}

            <button
              type="button"
              onClick={
                endCall
              }
              className="flex min-w-24 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500"
            >
              📞
              <span>
                End
              </span>
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default AppointmentCommunication;