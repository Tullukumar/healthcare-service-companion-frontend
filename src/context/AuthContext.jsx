import {
  createContext,
  useState,
} from "react";

const AuthContext = createContext(null);

// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const savedToken =
      localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("user");

    if (!savedToken || !savedUser) {
      return {
        token: null,
        user: null,
      };
    }

    try {
      return {
        token: savedToken,
        user: JSON.parse(savedUser),
      };
    } catch (error) {
      console.error(
        "Error loading saved user:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        token: null,
        user: null,
      };
    }
  });

  // ==========================================
  // LOGIN
  // ==========================================

  const login = (tokenValue, userValue) => {
    localStorage.setItem(
      "token",
      tokenValue
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userValue)
    );

    setAuth({
      token: tokenValue,
      user: userValue,
    });
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuth({
      token: null,
      user: null,
    });
  };

  // ==========================================
  // AUTHENTICATION STATUS
  // ==========================================

  const isAuthenticated =
    Boolean(
      auth.token && auth.user
    );

  // ==========================================
  // CONTEXT VALUE
  // ==========================================

  const value = {
    user: auth.user,
    token: auth.token,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;