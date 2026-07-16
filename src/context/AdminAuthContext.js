import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("admin_token"));
  const [loading, setLoading] = useState(true);

  // Set axios default header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/admin/profile")
      .then((res) => {
        setAdmin(res.data.data);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await api.post("/admin/login", { email, password });
    const { token: newToken, admin: adminData } = response.data.data;
    localStorage.setItem("admin_token", newToken);
    setToken(newToken);
    setAdmin(adminData);
    return adminData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}