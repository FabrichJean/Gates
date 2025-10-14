import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
// import { useNetworkStatus } from "../hooks/useNetworkStatus";
// import toast from "react-hot-toast";
// import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;

};

export default ProtectedRoute;