import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import useFetch from "http-react";
import { apiURL, token } from "../constant";
import type { User } from "./useVideos";

// 🔸 Hook personnalisé (pour simplifier l’accès au contexte)
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}

export const useUsers = () => {
  return useFetch<User[]>(apiURL + '/auth/users', {
    headers: { Authorization: `Bearer ${token()}` },
  })
}