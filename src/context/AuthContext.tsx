import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { loginApi, registerApi } from "../api/auth"; // 🔹 Appel backend centralisé
import { getToken, setToken, removeToken } from "../utils/storage"; // 🔹 Gestion du localStorage

// 🔸 Interface du contexte d'authentification
interface AuthContextType {
  user: any;
  token: string | null;
  isValidated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// 🔸 Création du contexte (valeur par défaut = undefined)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔸 Fournisseur du contexte d’authentification
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Au montage → on restaure le token depuis le localStorage
  useEffect(() => {
    const storedToken = getToken();
    if (storedToken) setTokenState(storedToken);
    setLoading(false);
  }, []);

  // 🔹 Fonction de connexion
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(email, password); // { token, user }
      setTokenState(data.token);
      setUser(data.user);
      setToken(data.token);
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
      const data = await registerApi(email, password, username ?? ""); // { token, userType }
      // setTokenState(data.token);
      setUser(data.user);
      // setIsValidated(true);
      // if (!data.token) throw new Error("Token manquant lors de l'inscription");
      // setToken(data.token);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
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
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error, isValidated }}>
      {children}
    </AuthContext.Provider>
  );
};
