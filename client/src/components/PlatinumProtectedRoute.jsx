import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const PlatinumProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  const subType = user?.subscription?.type;
  const allowed = subType === "platinum";

  if (!allowed) {
    return <Navigate to="/subscribe" replace />;
  }

  return children;
};

export default PlatinumProtectedRoute; 