import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, useAuthMe } from "../hooks/useAuth";
import { RotateLoader } from "react-spinners";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const {loading, error} = useAuthMe();

  useEffect(() => {

  }, [])

  return loading ? <div className="w-full h-screen flex items-center justify-center"><RotateLoader color="#00d3f2" className="w-14 h-auto" /></div> : !error ? children : <Navigate to="/login" replace />
};

export default ProtectedRoute;