import { useEffect, useState } from "react";

function DoctorSetup() {
  const [formData, setFormData] = useState({
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
    hospital: "",
    city: "",
    about: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");

  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);

  const [profileLoading, setProfileLoading] = useState(true);
  const [isExistingProfile, setIsExistingProfile] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD HOSPITALS + DOCTOR PROFILE
  // ==========================================

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as a doctor first.");
        setProfileLoading(false);
        setHospitalsLoading(false);
        return;
      }

      try {
        setError("");

        // --------------------------------------
        // LOAD HOSPITALS
        // --------------------------------------

        setHospitalsLoading(true);

       const hospitalsResponse = await fetch(
  `${import.meta.env.VITE_API_URL}/api/hospitals`
);

        const hospitalsData =
          await hospitalsResponse.json();

        if (!hospitalsResponse.ok) {
          throw new Error(
            hospitalsData.message ||
              "Failed to load hospitals."
          );
        }

        setHospitals(
          Array.isArray(hospitalsData.hospitals)
            ? hospitalsData.hospitals
            : []
        );

        setHospitalsLoading(false);

        // --------------------------------------
        // LOAD EXISTING DOCTOR PROFILE
        // --------------------------------------

        setProfileLoading(true);
const profileResponse = await fetch(
  `${import.meta.env.VITE_API_URL}/api/doctors/profile/me`,
  {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profileData =
          await profileResponse.json();

        // Profile does not exist yet
        if (profileResponse.status === 404) {
          setIsExistingProfile(false);
          return;
        }

        if (!profileResponse.ok) {
          throw new Error(
            profileData.message ||
              "Failed to load doctor profile."
          );
        }

        const doctorProfile =
          profileData.doctorProfile;

        if (!doctorProfile) {
          setIsExistingProfile(false);
          return;
        }

        // --------------------------------------
        // PROFILE EXISTS
        // --------------------------------------

        setIsExistingProfile(true);

        setFormData({
          specialization:
            doctorProfile.specialization || "",

          qualification:
            doctorProfile.qualification || "",

          experience:
            doctorProfile.experience ?? "",

          consultationFee:
            doctorProfile.consultationFee ?? "",

          hospital:
            doctorProfile.hospital?._id ||
            doctorProfile.hospital ||
            "",

          city:
            doctorProfile.city || "",

          about:
            doctorProfile.about || "",
        });

        setExistingImage(
          doctorProfile.profileImage || ""
        );
      } catch (error) {
        console.error(
          "Load doctor setup data error:",
          error
        );

        setError(
          error.message ||
            "Unable to load doctor profile."
        );
      } finally {
        setProfileLoading(false);
        setHospitalsLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // ==========================================
  // HANDLE PROFILE IMAGE
  // ==========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;

    setProfileImage(file);
    setError("");
    setMessage("");
  };

  // ==========================================
  // SUBMIT CREATE / UPDATE
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a doctor first.");
      return;
    }

    if (!formData.hospital) {
      setError("Please select a hospital.");
      return;
    }

    try {
      setLoading(true);

      const formDataToSend = new FormData();

      formDataToSend.append(
        "specialization",
        formData.specialization
      );

      formDataToSend.append(
        "qualification",
        formData.qualification
      );

      formDataToSend.append(
        "experience",
        formData.experience
      );

      formDataToSend.append(
        "consultationFee",
        formData.consultationFee
      );

      formDataToSend.append(
        "hospital",
        formData.hospital
      );

      formDataToSend.append(
        "city",
        formData.city
      );

      formDataToSend.append(
        "about",
        formData.about
      );

      // Only send image when doctor selects a new one
      if (profileImage) {
        formDataToSend.append(
          "profileImage",
          profileImage
        );
      }

      // --------------------------------------
      // CREATE OR UPDATE
      // --------------------------------------

      const method = isExistingProfile
        ? "PUT"
        : "POST";
       const response = await fetch(
 `${import.meta.env.VITE_API_URL}/api/doctors/profile`,
  {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to save doctor profile."
        );
      }

      setMessage(
        isExistingProfile
          ? "Doctor profile updated successfully!"
          : "Doctor profile created successfully!"
      );

      setIsExistingProfile(true);

      if (data.doctorProfile) {
        setExistingImage(
          data.doctorProfile.profileImage || ""
        );
      }

      setProfileImage(null);

      const fileInput =
        document.getElementById("profileImage");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(
        "Save doctor profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to save doctor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (profileLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />

          <p className="mt-4 text-sm text-slate-400">
            Loading doctor profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-6 py-16 text-white sm:px-8">

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">

          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Doctor Portal
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isExistingProfile
              ? "Edit Your Doctor Profile"
              : "Set Up Your Doctor Profile"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            {isExistingProfile
              ? "Update your professional information and profile picture whenever you want."
              : "Add your professional information so patients can discover you and understand your expertise."}
          </p>

        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">

          {/* Card Header */}
          <div className="border-b border-white/10 px-7 py-7 sm:px-9">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">

                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle
                    cx="12"
                    cy="7"
                    r="3.5"
                  />

                  <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />

                  <path d="M18 8v5M15.5 10.5h5" />
                </svg>

              </div>

              <div>

                <p className="text-sm font-bold text-white">
                  Professional Information
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {isExistingProfile
                    ? "Keep your professional profile up to date."
                    : "Complete your profile to become discoverable to patients."}
                </p>

              </div>

            </div>

          </div>

          <div className="px-7 py-8 sm:px-9">

            {/* Success */}
            {message && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm font-medium text-emerald-400"
              >
                <span className="font-bold">
                  ✓
                </span>

                <span>{message}</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400"
              >
                <span className="font-bold">
                  !
                </span>

                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* PROFILE IMAGE */}
              <div>

                <label
                  htmlFor="profileImage"
                  className="mb-3 block text-sm font-semibold text-slate-300"
                >
                  Profile Picture
                </label>

                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5">

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                    {/* Preview */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-800 text-slate-600">

                      {profileImage ? (
                        <img
                          src={URL.createObjectURL(
                            profileImage
                          )}
                          alt="New profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : existingImage ? (
                        <img
                          src={existingImage}
                          alt="Current profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <circle
                            cx="12"
                            cy="8"
                            r="3.5"
                          />

                          <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
                        </svg>
                      )}

                    </div>

                    <div className="flex-1">

                      <input
                        id="profileImage"
                        type="file"
                        name="profileImage"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
                      />

                      <p className="mt-2 text-xs text-slate-600">
                        JPG, PNG or WebP. Maximum 5 MB.
                      </p>

                      {profileImage && (
                        <p className="mt-2 truncate text-xs font-medium text-emerald-400">
                          New image selected:{" "}
                          {profileImage.name}
                        </p>
                      )}

                      {!profileImage &&
                        existingImage && (
                          <p className="mt-2 text-xs font-medium text-slate-500">
                            Current profile picture
                          </p>
                        )}

                    </div>

                  </div>

                </div>

              </div>

              {/* PROFESSIONAL DETAILS */}
              <div>

                <div className="mb-4">

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Professional Details
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    Your Expertise
                  </h2>

                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Specialization */}
                  <div className="sm:col-span-2">

                    <label
                      htmlFor="specialization"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Specialization
                    </label>

                    <input
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiologist"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                    />

                  </div>

                  {/* Qualification */}
                  <div className="sm:col-span-2">

                    <label
                      htmlFor="qualification"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Qualification
                    </label>

                    <input
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="e.g. MBBS, MD, DM"
                      required
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                    />

                  </div>

                  {/* Experience */}
                  <div>

                    <label
                      htmlFor="experience"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Experience
                    </label>

                    <div className="relative">

                      <input
                        id="experience"
                        name="experience"
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        required
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-16 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-600">
                        years
                      </span>

                    </div>

                  </div>

                  {/* Consultation Fee */}
                  <div>

                    <label
                      htmlFor="consultationFee"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Consultation Fee
                    </label>

                    <div className="relative">

                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                        ₹
                      </span>

                      <input
                        id="consultationFee"
                        name="consultationFee"
                        type="number"
                        min="0"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        placeholder="600"
                        required
                        className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-9 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* PRACTICE LOCATION */}
              <div className="border-t border-white/10 pt-7">

                <div className="mb-4">

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Practice Location
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    Where You Practice
                  </h2>

                </div>

                <div className="space-y-5">

                  {/* Hospital */}
                  <div>

                    <label
                      htmlFor="hospital"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      Hospital / Clinic
                    </label>

                    <select
                      id="hospital"
                      name="hospital"
                      value={formData.hospital}
                      onChange={handleChange}
                      required
                      disabled={hospitalsLoading}
                      className="h-12 w-full rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none transition hover:border-white/20 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <option value="">
                        {hospitalsLoading
                          ? "Loading hospitals..."
                          : "Select your hospital"}
                      </option>

                      {hospitals.map(
                        (hospital) => (
                          <option
                            key={hospital._id}
                            value={hospital._id}
                          >
                            {hospital.name} —{" "}
                            {hospital.city}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  {/* City */}
                  <div>

                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-semibold text-slate-300"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Noida"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                    />

                  </div>

                </div>

              </div>

              {/* ABOUT */}
              <div className="border-t border-white/10 pt-7">

                <div className="mb-4">

                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                    Professional Bio
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    About You
                  </h2>

                </div>

                <textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Tell patients about your experience, expertise, and approach to patient care..."
                  rows="6"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 hover:border-white/20 focus:border-blue-500 focus:bg-white/10"
                />

              </div>

              {/* SUBMIT */}
              <div className="border-t border-white/10 pt-7">

                <button
                  type="submit"
                  disabled={
                    loading || hospitalsLoading
                  }
                  className="group flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition duration-200 hover:bg-blue-500 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                      Saving Changes...
                    </>
                  ) : (
                    <>
                      {isExistingProfile
                        ? "Save Changes"
                        : "Create Doctor Profile"}

                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="ml-2 transition-transform duration-200 group-hover:translate-x-1"
                      >
                        <path
                          d="M5 12h14"
                          strokeLinecap="round"
                        />

                        <path
                          d="m13 6 6 6-6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}

                </button>

                <p className="mt-3 text-center text-xs text-slate-600">
                  Your professional information will be visible
                  to patients using HealthCompanion.
                </p>

              </div>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}

export default DoctorSetup;