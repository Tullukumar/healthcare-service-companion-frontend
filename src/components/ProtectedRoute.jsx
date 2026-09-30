import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  const token = localStorage.getItem("token");

  let user = null;

  // ==========================================
  // SAFELY READ USER FROM LOCAL STORAGE
  // ==========================================

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error(
      "Unable to read user from localStorage:",
      error
    );

    localStorage.removeItem("user");
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ==========================================
  // GET USER ROLE
  // ==========================================

  const userRole = String(user.role || "")
    .trim()
    .toLowerCase();

  // ==========================================
  // ROLE CHECK
  // ==========================================

  const normalizedAllowedRoles = allowedRoles.map((role) =>
    String(role).trim().toLowerCase()
  );

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(userRole)
  ) {
    console.warn(
      "ProtectedRoute: Access denied",
      {
        userRole,
        allowedRoles: normalizedAllowedRoles,
        currentPath: location.pathname,
      }
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // ==========================================
  // AUTHORIZED
  // ==========================================

  return <Outlet />;
}

export default ProtectedRoute;