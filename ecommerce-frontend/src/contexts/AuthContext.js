import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  showAuth: false,
  setShowAuth: () => {},
});

export function AuthProvider({ children }) {
  const [showAuth, setShowAuth] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );

  // keep isAuthenticated in sync with our window events
  useEffect(() => {
    const onLogin = () => setIsAuthenticated(true);
    const onLogout = () => setIsAuthenticated(false);
    window.addEventListener("login", onLogin);
    window.addEventListener("logout", onLogout);
    return () => {
      window.removeEventListener("login", onLogin);
      window.removeEventListener("logout", onLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, showAuth, setShowAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
