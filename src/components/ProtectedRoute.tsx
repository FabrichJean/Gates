import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { token, user, loading } = useAuth();
  const isOnline = useNetworkStatus();

// 🔔 Affiche un toast à chaque changement d’état réseau
  useEffect(() => {
    if (isOnline) {
      toast.success("Connexion Internet rétablie ✅", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
      });
    } else {
      toast.error("Aucune connexion Internet ❌", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
      });
    }
  }, [isOnline]);

    // 🔒 Redirige vers la page de login si l'utilisateur n'est pas authentifié
  if (loading) return <div>Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;

  // 🔒 Si utilisateur non validé → redirect page info
  if (user && !user.isValidated === false) {
    toast.warn("Votre compte n'a pas encore été validé par le superadmin ⚠️", {
      position: "top-left",
      autoClose: 5000,
      hideProgressBar: false,
    });
    return <Navigate to="/not-validated" replace />;
  }

  return <>{children}</>;

};

export default ProtectedRoute;