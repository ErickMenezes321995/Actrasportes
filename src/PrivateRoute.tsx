// src/PrivateRoute.tsx
import React, { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

interface PrivateRouteProps {
  children: ReactElement;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
