import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { deleteUserApi, loginApi, registerApi, validateUserApi, getMeApi } from "../api/auth"; // 🔹 Appel backend centralisé
import { getToken, setToken, removeToken } from "../utils/storage"; // 🔹 Gestion du localStorage
import { AuthContext } from ".";

// 🔸 Interface du contexte d'authentification
export interface AuthContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  validateUser: (userId: number) => Promise<void>; // added·
  deleteUser: (userId: number) => Promise<void>; // added·
  logout: () => void;
  loading: boolean;
  error: string | null;
}



// 🔸 Fournisseur du contexte d’authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Au montage → on restaure le token depuis le localStorage et on réhydrate l'utilisateur via /auth (me)
  useEffect(() => {
    const init = async () => {
      const storedToken = getToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      setTokenState(storedToken);
      try {
        const me = await getMeApi();
        setUser(me);
      } catch (err) {
        // token invalide ou erreur -> clear
        removeToken();
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // 🔹 Fonction de connexion
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(email, password); // { token, user }
      setTokenState(data.token);
      setUser(data.userType);
      setToken(data.token);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fonction d'inscription
  const register = async (email: string, password: string, username?: string) => {
    setLoading(true);
    setError(null);
    try {
      // ✅ on force une chaîne vide si "name" est undefined
  const data = await registerApi(email, username ?? "", password); // { token, userType }
      setUser(data.user);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fonction de validation d’un utilisateur (superadmin)
  const validateUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await validateUserApi(userId); // 🔥 appel API backend
      console.log("✅ Validation réussie:", res.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de la validation de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };
  // 🔹 Supprimer (désactiver) un utilisateur (superadmin)
  const deleteUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await deleteUserApi(userId);
      console.log("🗑️ Utilisateur supprimé :", res.message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };



  // 🔹 Fonction de déconnexion
  const logout = () => {
    setUser(null);
    setTokenState(null);
    removeToken();
  };

  // 🔹 Valeur partagée dans tout le projet
  return (
    <AuthContext.Provider value={{ user, token, login, register, validateUser, deleteUser, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
