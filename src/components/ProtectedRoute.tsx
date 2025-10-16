import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { RotateLoader } from "react-spinners";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, loading } = useAuth();

  return loading ? <div className="w-full h-screen flex items-center justify-center"><RotateLoader color="#00d3f2" className="w-14 h-auto" /></div> : token ? children : <Navigate to="/login" replace />
};

export default ProtectedRoute;