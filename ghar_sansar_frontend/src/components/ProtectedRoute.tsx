import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const userRole = (user?.role || "").toLowerCase();
  const userEmail = (user?.email || "").toLowerCase();
  const isAdmin = userRole === "admin" || userEmail === "gharsansarshop@gmail.com";

  if (role) {
    const requiredRole = role.toLowerCase();
    if (requiredRole === "admin" && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole !== "admin" && userRole !== requiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
