import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { apiURL } from "../constant";
import type { User } from "./useVideos";
import { getToken } from "../utils/storage";
import axios from "axios";

// 🔸 Hook personnalisé (pour simplifier l’accès au contexte)
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  return ctx;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useUsers = (search: string, params?: any) => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const token = getToken();
    const res = await axios.get(apiURL + '/auth/users?search=' + search, {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  return { data, reFetch: fetchUsers, loading };
};
