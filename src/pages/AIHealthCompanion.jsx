import { useState } from "react";

function AIAssistant({ role = "patient" }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      answer: {
        title: "Welcome to HealthCompanion AI",
        summary:
          "I can provide general health information and help you prepare questions for a healthcare professional.",
        sections: [
          {
            heading: "What I Can Help With",
            points: [
              "Explain general health information.",
              "Explain common medical terms.",
              "Help you prepare questions for your doctor.",
            ],
          },
        ],
        warning:
          "This information is for general guidance and does not replace professional medical advice.",
      },
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    // Add user message
    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      // ==========================================
      // GET TOKEN
      // ==========================================

      const token = localStorage.getItem("token");

      // ==========================================
      // API REQUEST
      // ==========================================

      const response = await fetch(
`${import.meta.env.VITE_API_URL}/api/ai/chat`,  {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },

          credentials: "include",

          body: JSON.stringify({
            message,
            role,
          }),
        }
      );

      // ==========================================
      // READ RESPONSE
      // ==========================================

      const data = await response.json();

      // ==========================================
      // CHECK RESPONSE
      // ==========================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to get AI response."
        );
      }

      if (!data.success || !data.answer) {
        throw new Error(
          "Invalid response received from AI service."
        );
      }

      // ==========================================
      // ADD AI RESPONSE
      // ==========================================

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          answer: data.answer,
        },
      ]);
    } catch (error) {
      console.error(
        "AI Assistant Error:",
        error
      );

      // ==========================================
      // ERROR MESSAGE
      // ==========================================

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          error:
            error.message ||
            "The AI service is currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="border-b border-white/10 bg-slate-900 px-5 py-5">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-2xl">
            🤖
          </div>

          <div>
            <h3 className="font-bold text-white">
              HealthCompanion AI
            </h3>

            <div className="mt-1 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <p className="text-xs text-slate-500">
                AI healthcare assistant
              </p>

            </div>
          </div>

        </div>

      </div>

      {/* ==========================================
          DISCLAIMER
      ========================================== */}

      <div className="border-b border-amber-500/10 bg-amber-500/5 px-5 py-4">

        <p className="text-xs leading-5 text-amber-300">
          ⚠️ AI provides general health information only.
          It does not replace a qualified healthcare
          professional or emergency medical care.
        </p>

      </div>

      {/* ==========================================
          MESSAGES
      ========================================== */}

      <div className="h-96 space-y-5 overflow-y-auto p-5">

        {messages.map(
          (message, index) => {

            const isUser =
              message.role === "user";

            // ======================================
            // USER MESSAGE
            // ======================================

            if (isUser) {
              return (
                <div
                  key={index}
                  className="flex justify-end"
                >
                  <div className="max-w-full rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white sm:max-w-3xl">
                    {message.content}
                  </div>
                </div>
              );
            }

            // ======================================
            // ERROR MESSAGE
            // ======================================

            if (message.error) {
              return (
                <div
                  key={index}
                  className="flex justify-start"
                >
                  <div className="max-w-full rounded-2xl rounded-bl-md border border-red-500/20 bg-red-500/5 px-5 py-4 sm:max-w-3xl">

                    <h4 className="font-semibold text-red-400">
                      Unable to respond
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {message.error}
                    </p>

                    <p className="mt-3 text-xs text-amber-300">
                      ⚠️ If you are experiencing a
                      medical emergency, contact
                      emergency medical services
                      immediately.
                    </p>

                  </div>
                </div>
              );
            }

            // ======================================
            // AI RESPONSE
            // ======================================

            const answer =
              message.answer;

            return (
              <div
                key={index}
                className="flex justify-start"
              >

                <div className="max-w-full rounded-2xl rounded-bl-md bg-slate-800 px-5 py-4 sm:max-w-3xl">

                  {/* TITLE */}

                  {answer?.title && (
                    <h4 className="text-base font-bold text-blue-400">
                      {answer.title}
                    </h4>
                  )}

                  {/* SUMMARY */}

                  {answer?.summary && (
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {answer.summary}
                    </p>
                  )}

                  {/* SECTIONS */}

                  {Array.isArray(
                    answer?.sections
                  ) &&
                    answer.sections.map(
                      (
                        section,
                        sectionIndex
                      ) => (
                        <div
                          key={
                            sectionIndex
                          }
                          className="mt-5"
                        >

                          <h5 className="text-sm font-semibold text-white">
                            {
                              section.heading
                            }
                          </h5>

                          {/* POINTS */}

                          {Array.isArray(
                            section.points
                          ) && (
                            <ul className="mt-2 space-y-2">

                              {section.points.map(
                                (
                                  point,
                                  pointIndex
                                ) => (
                                  <li
                                    key={
                                      pointIndex
                                    }
                                    className="flex gap-2 text-sm leading-6 text-slate-400"
                                  >

                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />

                                    <span>
                                      {point}
                                    </span>

                                  </li>
                                )
                              )}

                            </ul>
                          )}

                        </div>
                      )
                    )}

                  {/* WARNING */}

                  {answer?.warning && (
                    <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">

                      <p className="text-xs leading-5 text-amber-300">
                        ⚠️ {answer.warning}
                      </p>

                    </div>
                  )}

                </div>

              </div>
            );
          }
        )}

        {/* ========================================
            LOADING
        ======================================== */}

        {loading && (
          <div className="flex justify-start">

            <div className="rounded-2xl rounded-bl-md bg-slate-800 px-4 py-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />

                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />

                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />

                <span className="ml-2 text-xs text-slate-500">
                  AI is thinking...
                </span>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* ==========================================
          INPUT
      ========================================== */}

      <form
        onSubmit={sendMessage}
        className="border-t border-white/10 bg-slate-900 p-4"
      >

        <div className="flex flex-col gap-3 sm:flex-row">

          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            placeholder="Ask a health-related question..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 transition focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
            className="shrink-0 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "..."
              : "Send"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default AIAssistant;