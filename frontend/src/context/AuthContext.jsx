import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("campusflow_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getProfile(token);
        setUser(profile);
      } catch (e) {
        setToken(null);
        localStorage.removeItem("campusflow_token");
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const { token: newToken, user: newUser } = await api.login({ email, password });
    localStorage.setItem("campusflow_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  async function register(payload) {
    const { token: newToken, user: newUser } = await api.register(payload);
    localStorage.setItem("campusflow_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("campusflow_token");
    setToken(null);
    setUser(null);
  }

  function updateLocalUser(patch) {
    setUser((u) => ({ ...u, ...patch }));
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
