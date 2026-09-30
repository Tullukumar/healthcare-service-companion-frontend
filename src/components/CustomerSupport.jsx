import { useState } from "react";

function CustomerSupport() {
  const [category, setCategory] = useState("PAYMENT");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");

  // ==========================================
  // ATTACHMENT
  // ==========================================

  const [attachment, setAttachment] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supportPhone =
    import.meta.env.VITE_SUPPORT_PHONE ||
    "+919999999999";

  // ==========================================
  // FILE SELECT
  // ==========================================

  const handleAttachmentChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setAttachment(null);
      return;
    }

    // Maximum 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Attachment must be smaller than 5 MB.");
      e.target.value = "";
      setAttachment(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP, PDF, DOC and DOCX files are allowed."
      );

      e.target.value = "";
      setAttachment(null);
      return;
    }

    setError("");
    setAttachment(file);
  };

  // ==========================================
  // REMOVE ATTACHMENT
  // ==========================================

  const removeAttachment = () => {
    setAttachment(null);

    const fileInput =
      document.getElementById("support-attachment");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // ==========================================
  // SUBMIT SUPPORT TICKET
  // ==========================================

  const submitTicket = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      // ========================================
      // VALIDATION
      // ========================================

      if (!subject.trim()) {
        setError("Please enter a subject.");
        setLoading(false);
        return;
      }

      if (!description.trim()) {
        setError("Please describe your problem.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      // ========================================
      // FORM DATA
      // ========================================

      const formData = new FormData();

      formData.append("category", category);
      formData.append("subject", subject.trim());
      formData.append(
        "description",
        description.trim()
      );
      formData.append("priority", priority);

      // ========================================
      // ATTACHMENT
      // ========================================

      if (attachment) {
        formData.append(
          "attachment",
          attachment
        );
      }

      // ========================================
      // API REQUEST
      // ========================================
const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/support/tickets`,
  {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      // ========================================
      // ERROR
      // ========================================

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to contact customer care."
        );
      }

      // ========================================
      // SUCCESS
      // ========================================

      setMessage(
        "Your support request has been sent to customer care."
      );

      // ========================================
      // RESET FORM
      // ========================================

      setSubject("");
      setDescription("");
      setPriority("MEDIUM");
      setAttachment(null);

      const fileInput =
        document.getElementById(
          "support-attachment"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Customer support error:",
        err
      );

      setError(
        err.message ||
          "Unable to send support request."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CALL SUPPORT
  // ==========================================

  const callSupport = () => {
    window.location.href = `tel:${supportPhone}`;
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-cyan-400">
            CUSTOMER CARE
          </p>

          <h1 className="text-3xl font-bold md:text-4xl">
            How can we help you?
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Having a problem with your payment,
            doctor, appointment, hospital or anything
            else? Contact our customer care team and
            we'll help you resolve it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* ======================================
              CALL SUPPORT
          ====================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl">
              📞
            </div>

            <h2 className="text-xl font-bold">
              Call Customer Care
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Need immediate help? Call our customer
              care team directly.
            </p>

            <button
              type="button"
              onClick={callSupport}
              className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400"
            >
              📞 Call Support
            </button>
          </div>

          {/* ======================================
              MESSAGE SUPPORT
          ====================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:col-span-2">

            <div className="mb-6">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl">
                💬
              </div>

              <h2 className="text-xl font-bold">
                Message Customer Care
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Tell us about your problem and attach
                a screenshot or document if it helps
                explain the problem.
              </p>
            </div>

            {/* ====================================
                ERROR
            ==================================== */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* ====================================
                SUCCESS
            ==================================== */}

            {message && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <form
              onSubmit={submitTicket}
              className="space-y-5"
            >

              {/* ==================================
                  CATEGORY
              ================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  What can we help you with?
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                >
                  <option value="PAYMENT">
                    Payment Problem
                  </option>

                  <option value="DOCTOR">
                    Doctor Problem
                  </option>

                  <option value="APPOINTMENT">
                    Appointment / Booking Problem
                  </option>

                  <option value="HOSPITAL">
                    Hospital Problem
                  </option>

                  <option value="MEDICINE">
                    Medicine Problem
                  </option>

                  <option value="OTHER">
                    Other Problem
                  </option>
                </select>
              </div>

              {/* ==================================
                  SUBJECT
              ================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Subject
                </label>

                <input
                  type="text"
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                  placeholder="Briefly describe your problem"
                  maxLength={150}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* ==================================
                  DESCRIPTION
              ================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Describe your problem
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Explain your problem in detail..."
                  rows={6}
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* ==================================
                  PRIORITY
              ================================== */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                >
                  <option value="LOW">
                    Low
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="URGENT">
                    Urgent
                  </option>
                </select>
              </div>

              {/* ==================================
                  ATTACHMENT
              ================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Attach Screenshot / Document
                  <span className="ml-2 font-normal text-slate-500">
                    Optional
                  </span>
                </label>

                <div className="rounded-xl border border-dashed border-white/20 bg-slate-900 p-4">

                  <input
                    id="support-attachment"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    onChange={
                      handleAttachmentChange
                    }
                    className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950 hover:file:bg-cyan-400"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    JPG, PNG, WEBP, PDF, DOC or DOCX
                    • Maximum 5 MB
                  </p>

                  {/* SELECTED FILE */}

                  {attachment && (
                    <div className="mt-4 flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-3">

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-cyan-300">
                          📎 {attachment.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {(
                            attachment.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          removeAttachment
                        }
                        className="ml-3 rounded-lg px-3 py-1 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                      >
                        Remove
                      </button>

                    </div>
                  )}

                </div>
              </div>

              {/* ==================================
                  SUBMIT
              ================================== */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Sending..."
                  : "💬 Send to Customer Care"}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerSupport;