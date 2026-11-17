import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, authApi, ensureCsrf, setAccessToken } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const restoreStarted = useRef(false);

  const loadCurrentUser = useCallback(async () => {
    const response = await authApi.me();
    setUser(response.data);
    return response.data;
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    const token = response.data?.token;

    if (!token) {
      throw new Error("El backend no devolvió el access token en data.token.");
    }

    setAccessToken(token);
    return loadCurrentUser();
  }, [loadCurrentUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    async function restoreSession() {
      try {
        await ensureCsrf();
        const response = await api.post("/auth/refresh");
        const token = response.data?.token;

        if (!token) throw new Error("No se recibió el access token.");

        setAccessToken(token);
        const meResponse = await authApi.me();

        setUser(meResponse.data);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    reloadUser: loadCurrentUser,
  }), [user, loading, login, logout, loadCurrentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
