import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

function cleanAIText(text) {
  if (text === null || text === undefined) {
    return "";
  }

  return String(text)
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/^\s*svg\s*$/gim, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/(?<!\*)\*(?!\s)(.*?)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_(?!\s)(.*?)_(?!_)/g, "$1")
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanPoint(point) {
  if (!point) {
    return "";
  }

  return cleanAIText(
    String(point)
      .replace(/^[-•*]\s*/g, "")
      .replace(/^\d+[.)]\s*/g, "")
  );
}

function normalizeAnswer(answer) {
  if (!answer) {
    return null;
  }

  // ------------------------------------------
  // OBJECT RESPONSE
  // ------------------------------------------

  if (
    typeof answer === "object" &&
    !Array.isArray(answer)
  ) {
    return {
      title:
        cleanAIText(answer.title) ||
        "AI Guidance",

      summary:
        cleanAIText(answer.summary),

      sections:
        Array.isArray(answer.sections)
          ? answer.sections
              .map((section) => ({
                heading:
                  cleanAIText(
                    section?.heading
                  ) ||
                  "Guidance",

                points:
                  Array.isArray(
                    section?.points
                  )
                    ? section.points
                        .map((point) =>
                          cleanPoint(point)
                        )
                        .filter(Boolean)
                    : [],
              }))
              .filter(
                (section) =>
                  section.heading ||
                  section.points.length > 0
              )
          : [],

      warning:
        cleanAIText(answer.warning),
    };
  }

  // ------------------------------------------
  // STRING RESPONSE
  // ------------------------------------------

  if (
    typeof answer === "string"
  ) {
    return {
      title: "AI Guidance",

      summary:
        cleanAIText(answer),

      sections: [],

      warning: "",
    };
  }

  return null;
}

function AIAssistant({
  role = "patient",
}) {
  const [message, setMessage] =
    useState("");

  const [answer, setAnswer] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const roleTitles = {
    patient:
      "Patient Health Assistant",

    doctor:
      "Doctor Clinical Assistant",

    ambulance:
      "Emergency Support Assistant",

    admin:
      "Healthcare Admin Assistant",
  };

  const roleDescriptions = {
    patient:
      "Get general health guidance and prepare questions for your healthcare provider.",

    doctor:
      "Get consultation preparation and general clinical workflow guidance.",

    ambulance:
      "Get general emergency-response and transport guidance.",

    admin:
      "Get healthcare-service management and workflow guidance.",
  };

  const assistantTitle =
    roleTitles[role] ||
    "Healthcare Assistant";

  const assistantDescription =
    roleDescriptions[role] ||
    "Get helpful healthcare guidance from HealthCompanion AI";


  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer(null);

      // --------------------------------------
      // GET TOKEN
      // --------------------------------------

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      // --------------------------------------
      // API REQUEST
      // --------------------------------------

      const response =
        await fetch(
          `${API_BASE_URL}/api/ai`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              message:
                trimmedMessage,

              role,
            }),
          }
        );

      // --------------------------------------
      // READ RESPONSE SAFELY
      // --------------------------------------

      let data;

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        contentType &&
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        data = {
          success: false,
          message:
            text ||
            "The server returned an invalid response.",
        };
      }

      console.log(
        "AI RESPONSE:",
        data
      );

      // --------------------------------------
      // HTTP ERROR
      // --------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `AI request failed with status ${response.status}.`
        );
      }

      // --------------------------------------
      // API ERROR
      // --------------------------------------

      if (
        data?.success === false
      ) {
        throw new Error(
          data?.message ||
            "Unable to generate an AI response."
        );
      }

      // --------------------------------------
      // EXTRACT ANSWER
      // --------------------------------------

      let rawAnswer =
        data?.answer ??
        data?.response ??
        data?.result ??
        data?.data?.answer ??
        data?.data?.response;

      // Some APIs return the complete
      // response under data.data
      if (
        !rawAnswer &&
        data?.data &&
        typeof data.data === "string"
      ) {
        rawAnswer =
          data.data;
      }

      const normalizedAnswer =
        normalizeAnswer(
          rawAnswer
        );

      // --------------------------------------
      // INVALID AI RESPONSE
      // --------------------------------------

      if (!normalizedAnswer) {
        throw new Error(
          "The AI server responded, but no valid answer was returned."
        );
      }

      setAnswer(
        normalizedAnswer
      );

      setMessage("");
    } catch (err) {
      console.error(
        "AI assistant error:",
        err
      );

      setError(
        err?.message ||
          "Unable to connect to HealthCompanion AI."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // CLEAR
  // ==========================================

  const clearResponse = () => {
    setAnswer(null);
    setError("");
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="w-full overflow-hidden rounded-3xl border border-cyan-400/10 bg-slate-900 shadow-2xl shadow-black/30">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="border-b border-white/10 bg-slate-900 px-6 py-6 sm:px-7">

        <div className="flex items-start gap-4">

          {/* AI ICON */}

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">

            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-1l-3 4-3-4H8a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4V7a4 4 0 0 1 4-4Z" />

              <path d="M9 12h.01" />
              <path d="M12 12h.01" />
              <path d="M15 12h.01" />
            </svg>

          </div>


          {/* HEADER TEXT */}

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-3">

              <h2 className="text-lg font-bold text-white">
                HealthCompanion AI
              </h2>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                AI Assistant
              </span>

            </div>

            <p className="mt-1 text-sm text-slate-400">
              {assistantTitle}
            </p>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
              {assistantDescription}
            </p>

          </div>

        </div>

      </div>


      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="p-6 sm:p-7">


        {/* ====================================
            ERROR
        ==================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-400">

            <svg
              className="mt-0.5 shrink-0"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>

            <span>
              {error}
            </span>

          </div>
        )}


        {/* ====================================
            LOADING
        ==================================== */}

        {loading && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-slate-800 p-5">

            <div className="flex items-center gap-3">

              <div className="flex gap-1">

                <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />

                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                  style={{
                    animationDelay:
                      "150ms",
                  }}
                />

                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                  style={{
                    animationDelay:
                      "300ms",
                  }}
                />

              </div>

              <span className="text-sm text-slate-400">
                HealthCompanion AI is thinking...
              </span>

            </div>

          </div>
        )}


        {/* ====================================
            RESPONSE
        ==================================== */}

        {answer &&
          !loading && (
            <div className="space-y-5">

              {/* TITLE */}

              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                      AI Guidance
                    </p>

                    <h3 className="mt-2 text-xl font-bold leading-7 text-white">
                      {answer.title ||
                        "AI Guidance"}
                    </h3>

                  </div>

                  <button
                    type="button"
                    onClick={
                      clearResponse
                    }
                    className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-white/20 hover:text-white"
                  >
                    Clear
                  </button>

                </div>


                {answer.summary && (
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-400">
                    {answer.summary}
                  </p>
                )}

              </div>


              {/* SECTIONS */}

              {Array.isArray(
                answer.sections
              ) &&
                answer.sections.length >
                  0 && (
                  <div className="space-y-4">

                    {answer.sections.map(
                      (
                        section,
                        index
                      ) => (
                        <div
                          key={`section-${index}`}
                          className="rounded-2xl border border-white/10 bg-slate-800 p-5"
                        >

                          <div className="flex items-start gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/10 text-xs font-bold text-blue-300">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">

                              <h4 className="font-bold text-white">
                                {section.heading ||
                                  `Step ${
                                    index +
                                    1
                                  }`}
                              </h4>

                              {Array.isArray(
                                section.points
                              ) &&
                                section.points.length >
                                  0 && (
                                  <ul className="mt-3 space-y-2.5">

                                    {section.points.map(
                                      (
                                        point,
                                        pointIndex
                                      ) => (
                                        <li
                                          key={
                                            pointIndex
                                          }
                                          className="flex items-start gap-3 text-sm leading-6 text-slate-400"
                                        >

                                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />

                                          <span>
                                            {point}
                                          </span>

                                        </li>
                                      )
                                    )}

                                  </ul>
                                )}

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}


              {/* WARNING */}

              {answer.warning && (
                <div className="rounded-2xl border border-amber-400/10 bg-amber-400/5 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-300">

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
                        <path d="M12 3L2.8 20h18.4L12 3Z" />
                        <path d="M12 9v5" />
                        <path d="M12 17h.01" />
                      </svg>

                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        Important
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-400">
                        {answer.warning}
                      </p>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}


        {/* ====================================
            EMPTY STATE
        ==================================== */}

        {!answer &&
          !loading &&
          !error && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/30 px-6 py-8 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/5 text-cyan-400">

                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-1l-3 4-3-4H8a4 4 0 0 1-4-4v-1a4 4 0 0 1 4-4V7a4 4 0 0 1 4-4Z" />

                  <path d="M9 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M15 12h.01" />
                </svg>

              </div>

              <h3 className="mt-4 font-semibold text-white">
                Ask HealthCompanion AI
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
                Ask a healthcare-related question
                to receive structured guidance.
              </p>

            </div>
          )}


        {/* ====================================
            INPUT
        ==================================== */}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >

          <input
            type="text"
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            placeholder="Ask HealthCompanion AI..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !message.trim()
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
          >

            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                Thinking...
              </>
            ) : (
              <>
                Ask AI

                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>

              </>
            )}

          </button>

        </form>


        {/* DISCLAIMER */}

        <p className="mt-4 text-center text-xs leading-5 text-slate-600">
          HealthCompanion AI provides general guidance
          and does not replace professional medical
          advice or emergency services.
        </p>

      </div>

    </section>
  );
}

export default AIAssistant;