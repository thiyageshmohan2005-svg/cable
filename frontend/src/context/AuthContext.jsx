import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch (_error) {
    return null;
  }
}

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem("cablepro_user"));
  } catch (_error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("cablepro_token"));
  const [user, setUser] = useState(storedUser);
  const [booting, setBooting] = useState(true);

  const logout = useCallback((message) => {
    localStorage.removeItem("cablepro_token");
    localStorage.removeItem("cablepro_user");
    setToken(null);
    setUser(null);
    if (message) toast.error(message);
  }, []);

  const login = useCallback(async ({ mobile, password }) => {
    const { data } = await api.post("/auth/login", { mobile, password });
    localStorage.setItem("cablepro_token", data.token);
    localStorage.setItem("cablepro_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const onLogout = () => logout("Session expired. Please log in again.");
    window.addEventListener("cablepro:logout", onLogout);
    return () => window.removeEventListener("cablepro:logout", onLogout);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return undefined;
    }

    const payload = decodeJwt(token);
    if (!payload?.exp) {
      logout("Session expired. Please log in again.");
      setBooting(false);
      return undefined;
    }

    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      logout("Session expired. Please log in again.");
      setBooting(false);
      return undefined;
    }

    setBooting(false);
    const timer = window.setTimeout(() => {
      logout("Session expired. Please log in again.");
    }, msUntilExpiry);

    return () => window.clearTimeout(timer);
  }, [logout, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      booting,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === "admin",
      isCollector: user?.role === "collector",
      login,
      logout
    }),
    [booting, login, logout, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
