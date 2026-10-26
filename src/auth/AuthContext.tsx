import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken, setToken } from "./tokenStorage";
import { removeStoredUser } from "./userStorage";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getToken()));
  const navigate = useNavigate();

  const logout = useCallback(() => {
    removeToken();
    removeStoredUser();
    setIsAuthenticated(false);
    sessionStorage.removeItem("strixAnnouncementAfterLogin");
    navigate("/login", { replace: true });
  }, [navigate]);

  const login = useCallback((token: string) => {
    setToken(token);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!getToken()) setIsAuthenticated(false);
  }, []);

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
};
