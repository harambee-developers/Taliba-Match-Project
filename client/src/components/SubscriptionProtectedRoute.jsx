import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const SubscriptionProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  const subType = user?.subscription?.type;
  const allowed = subType === "gold" || subType === "platinum";

  if (!allowed) {
    return <Navigate to="/subscribe" replace />;
  }

  return children;
};

export default SubscriptionProtectedRoute;
