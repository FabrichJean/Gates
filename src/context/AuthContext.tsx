/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { deleteUserApi, loginApi, registerApi, validateUserApi, getMeApi } from "../api/auth"; // 🔹 Appel backend centralisé
import { getToken, setToken, removeToken } from "../utils/storage"; // 🔹 Gestion du localStorage
import { AuthContext } from ".";
import type { User } from "../hooks/useVideos";

// Helper: decode JWT payload (returns claims or null)
function parseJwt(token?: string | null) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// 🔸 Interface du contexte d'authentification
export interface AuthContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Partial<User> | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: (email: string, password: string, username?: string) => Promise<any>;
  validateUser: (userId: number) => Promise<void>; // added·
  deleteUser: (userId: number) => Promise<void>; // added·
  logout: () => void;
  loading: boolean;
  error: string | null;
}



// 🔸 Fournisseur du contexte d’authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<Partial<User> | null>(null);
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
        // If backend returns minimal info (like only role), try to enrich from token
        if (me && (me.email || me.id || me.username)) {
          setUser(me);
        } else {
          // fallback to parse token claims
          const claims = parseJwt(storedToken);
          if (claims) {
            setUser({
              id: claims.id ?? claims.sub,
              email: claims.email,
              username: claims.username ?? claims.name,
              role: claims.role ?? me.role ?? me.userType,
              isValidated: claims.isValidated ?? me.isValidated ?? false,
            });
          } else {
            setUser(me);
          }
        }
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
      // If server returns a full user object, use it. Otherwise try token claims.
      if (data.user && (data.user.email || data.user.id || data.user.username)) {
        setUser(data.user);
      } else if (data.userType) {
        // backend sometimes returns only userType (legacy). Create a minimal user object
        const claims = parseJwt(data.token);
        if (claims) {
          setUser({
            id: claims.id ?? claims.sub,
            email: claims.email,
            username: claims.username ?? claims.name,
            role: claims.role ?? data.userType,
            isValidated: claims.isValidated ?? data.isValidated ?? false,
          });
        } else {
          setUser({ role: data.userType });
        }
      }
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
      const data = await registerApi(email, username ?? "", password); // { token, user }
      // Do NOT persist token or auto-login after register. Backend returns token for convenience
      // but users should confirm via login (and wait for validation if needed).
      return data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
      throw err;
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
