import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import toast from "react-hot-toast";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const auth = useAuth();
  const { token } = auth;
  const isOnline = useNetworkStatus();
  console.log(auth);
  

// 🔔 Affiche un toast à chaque changement d’état réseau
  useEffect(() => {
    if (isOnline) {
      toast.success("Connexion Internet rétablie");
    } else {
      toast.error("Aucune connexion Internet");
    }
  }, [isOnline]);

  if (!token) return <Navigate to="/login" replace />;

  // if () 

  return <>{children}</>;

};

export default ProtectedRoute;