import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";

function Icon({ name, size = 18 }) {
  const icons = {
    github: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.5 5.5 0 0 0 19.3 3.7A5.1 5.1 0 0 0 19.2 0S18 0 15 2a13.4 13.4 0 0 0-6 0C6 0 4.8 0 4.8 0a5.1 5.1 0 0 0-.1 3.7A5.5 5.5 0 0 0 3.2 7.5c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 9 18v4" />
        <path d="M9 18c-4.5 2-5-2-7-2" />
      </>
    ),

    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),

    instagram: (
      <>
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
        />

        <circle
          cx="12"
          cy="12"
          r="4"
        />

        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),

    mail: (
      <>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />

        <path d="m3 7 9 6 9-6" />
      </>
    ),

    arrow: (
      <path d="m9 18 6-6-6-6" />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  );
}

function App() {
  const [serverStatus, setServerStatus] =
    useState("checking");

  useEffect(() => {
    const checkServer = async () => {
    try {
 const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/health`
);

        if (response.ok) {
          setServerStatus("online");
        } else {
          setServerStatus("offline");
        }
      } catch (error) {
        console.error(
          "Backend connection error:",
          error
        );

        setServerStatus("offline");
      }
    };

    checkServer();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* ==========================================
          BACKEND STATUS
      ========================================== */}

      <div className="border-b border-white/10 bg-slate-950 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-xs font-semibold">
          <span
            className={`h-2 w-2 rounded-full ${
              serverStatus === "online"
                ? "bg-emerald-400"
                : serverStatus === "offline"
                ? "bg-red-400"
                : "bg-amber-400"
            }`}
          />

          {serverStatus === "online" && (
            <span className="text-emerald-400">
              Backend connected
            </span>
          )}

          {serverStatus === "offline" && (
            <span className="text-red-400">
              Backend unavailable
            </span>
          )}

          {serverStatus === "checking" && (
            <span className="text-amber-400">
              Checking backend...
            </span>
          )}
        </div>
      </div>

      {/* ==========================================
          APPLICATION ROUTES
      ========================================== */}

      <AppRoutes />

      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950">
        {/* Glow Effects */}

        <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            {/* ======================================
                BRAND
            ====================================== */}

            <div className="lg:col-span-2">
              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                  H
                </div>

                <div>
                  <p className="text-lg font-bold text-white">
                    HealthCompanion
                  </p>

                  <p className="text-xs text-slate-600">
                    Healthcare, connected.
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
                A connected healthcare platform designed
                to help patients discover doctors, manage
                appointments, explore hospitals, and access
                emergency assistance.
              </p>

              {/* Social Links */}

              <div className="mt-6 flex items-center gap-3">
                <a
                  href="https://github.com/Tullukumar"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Icon name="github" />
                </a>

                <a
                  href="https://www.linkedin.com/in/manvendra-kumar-b6a381382/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Icon name="linkedin" />
                </a>

                <a
                  href="https://www.instagram.com/_about_x_/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Icon name="instagram" />
                </a>

                <a
                  href="mailto:manvendraroy1234@gmail.com"
                  aria-label="Email"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Icon name="mail" />
                </a>
              </div>
            </div>

            {/* ======================================
                PLATFORM
            ====================================== */}

            <div>
              <h3 className="text-sm font-bold text-white">
                Platform
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink to="/find-doctors">
                  Find Doctors
                </FooterLink>

                <FooterLink to="/hospitals">
                  Hospitals
                </FooterLink>

                <FooterLink to="/sevacare">
                  SevaCare
                </FooterLink>

                <FooterLink to="/emergency">
                  Emergency
                </FooterLink>
              </div>
            </div>

            {/* ======================================
                ACCOUNT
            ====================================== */}

            <div>
              <h3 className="text-sm font-bold text-white">
                Account
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink to="/login">
                  Sign In
                </FooterLink>

                <FooterLink to="/register">
                  Create Account
                </FooterLink>

                <FooterLink to="/profile">
                  Profile
                </FooterLink>

                <FooterLink to="/appointments">
                  Appointments
                </FooterLink>

                <FooterLink to="/customer-support">
                  Customer Support
                </FooterLink>
              </div>
            </div>
          </div>

          {/* ======================================
              BOTTOM
          ====================================== */}

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} HealthCompanion.
              All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              Built for better healthcare

              <span className="text-blue-400">
                <Icon
                  name="arrow"
                  size={14}
                />
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-400"
    >
      <span>{children}</span>

      <span className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
        <Icon
          name="arrow"
          size={14}
        />
      </span>
    </Link>
  );
}

export default App;