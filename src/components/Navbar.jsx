import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

function Icon({ name, size = 18 }) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "menu") {
    return (
      <svg {...commonProps}>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...commonProps}>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...commonProps}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  if (name === "doctor") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="7" r="3.5" />
        <path d="M5 21c.8-4.2 3.2-6.5 7-6.5s6.2 2.3 7 6.5" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg {...commonProps}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
      </svg>
    );
  }

  return null;
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const token = localStorage.getItem("token");

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Failed to read user from localStorage:",
      error
    );
    user = null;
  }

  const userRole = user?.role?.toLowerCase() || "";

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    closeMenus();

    navigate("/login");
  };

  const navLinks = [
    {
      label: "Doctors",
      path: "/doctors",
    },
    {
      label: "Hospitals",
      path: "/hospitals",
    },
    {
      label: "SevaCare",
      path: "/sevacare",
    },
    {
      label: "Emergency",
      path: "/emergency",
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenus}
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition group-hover:bg-blue-500">
            H
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white">
              HealthCompanion
            </p>

            <p className="text-xs text-slate-600">
              Healthcare, connected.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Account */}
        <div className="hidden items-center gap-3 lg:flex">
          {!token ? (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">

              {/* Profile Button */}
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (current) => !current
                  )
                }
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10"
                aria-expanded={profileOpen}
                aria-label="Open account menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Icon name="doctor" size={17} />
                </div>

                <div className="hidden text-left xl:block">
                  <p className="max-w-32 truncate text-sm font-semibold text-white">
                    {user?.name || "Account"}
                  </p>

                  <p className="text-xs capitalize text-slate-600">
                    {userRole || "User"}
                  </p>
                </div>

                <Icon name="chevron" size={15} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl shadow-black/40">

                  {/* Account Info */}
                  <div className="mb-2 rounded-xl bg-white/5 px-4 py-3">
                    <p className="truncate text-sm font-bold text-white">
                      {user?.name || "Account"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-600">
                      {user?.email || ""}
                    </p>

                    <p className="mt-1 text-xs capitalize text-blue-400">
                      {userRole || "User"}
                    </p>
                  </div>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    onClick={closeMenus}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Profile
                  </Link>

                  {/* Patient Links */}
                  {userRole === "patient" && (
                    <>
                      <Link
                        to="/patient-dashboard"
                        onClick={closeMenus}
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/appointments"
                        onClick={closeMenus}
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        My Appointments
                      </Link>
                    </>
                  )}

                  {/* Doctor Links */}
                  {userRole === "doctor" && (
                    <>
                      <Link
                        to="/doctor-appointments"
                        onClick={closeMenus}
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Doctor Appointments
                      </Link>

                      <Link
                        to="/doctor-setup"
                        onClick={closeMenus}
                        className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                      >
                        Doctor Profile
                      </Link>
                    </>
                  )}

                  {/* Admin */}
                  {userRole === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {/* Ambulance Driver */}
                  {userRole === "ambulance" && (
                    <Link
                      to="/ambulance-dashboard"
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Ambulance Dashboard
                    </Link>
                  )}

                  <div className="my-2 border-t border-white/10" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                  >
                    <Icon name="logout" size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              (current) => !current
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 lg:hidden"
          aria-label={
            mobileOpen
              ? "Close navigation"
              : "Open navigation"
          }
          aria-expanded={mobileOpen}
        >
          <Icon
            name={
              mobileOpen ? "close" : "menu"
            }
            size={20}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-slate-950 px-5 py-5 lg:hidden">

          {/* Navigation */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenus}
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Account */}
          <div className="mt-4 border-t border-white/10 pt-4">
            {!token ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenus}
                  className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenus}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-blue-500"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div>

                {/* User Info */}
                <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon name="doctor" size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {user?.name || "Account"}
                    </p>

                    <p className="truncate text-xs text-slate-600">
                      {user?.email || ""}
                    </p>

                    <p className="mt-1 text-xs capitalize text-blue-400">
                      {userRole || "User"}
                    </p>
                  </div>
                </div>

                {/* Profile */}
                <Link
                  to="/profile"
                  onClick={closeMenus}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  Profile
                </Link>

                {/* Patient */}
                {userRole === "patient" && (
                  <>
                    <Link
                      to="/patient-dashboard"
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/appointments"
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      My Appointments
                    </Link>
                  </>
                )}

                {/* Doctor */}
                {userRole === "doctor" && (
                  <>
                    <Link
                      to="/doctor-appointments"
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Doctor Appointments
                    </Link>

                    <Link
                      to="/doctor-setup"
                      onClick={closeMenus}
                      className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                    >
                      Doctor Profile
                    </Link>
                  </>
                )}

                {/* Admin */}
                {userRole === "admin" && (
                  <Link
                    to="/admin-dashboard"
                    onClick={closeMenus}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* Ambulance Driver */}
                {userRole === "ambulance" && (
                  <Link
                    to="/ambulance-dashboard"
                    onClick={closeMenus}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Ambulance Dashboard
                  </Link>
                )}

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-2 flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  <Icon name="logout" size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;