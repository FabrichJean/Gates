import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RotateLoader } from "react-spinners";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, loading, user } = useAuth();

  // While auth is loading, show spinner
  if (loading) return <div className="w-full h-screen flex items-center justify-center"><RotateLoader color="#00d3f2" className="w-14 h-auto" /></div>;

  // Not authenticated
  if (!token) return <Navigate to="/login" replace />;

  // If user object exists and is not validated -> redirect to profile where status is shown
  // If there is a token but no populated user object yet, or user explicitly not validated -> redirect to login
  if (!user || (typeof user === 'object' && user.isValidated === false)) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated and validated -> allow
  return <>{children}</>;
};

export default ProtectedRoute;