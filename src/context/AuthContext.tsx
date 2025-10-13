import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { loginApi } from "../api/auth"; // 🔹 Appel backend centralisé
import { getToken, setToken, removeToken } from "../utils/storage"; // 🔹 Gestion du localStorage


// 🔸 Interface du contexte d'authentification
interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true); // ⬅️ commence par true
  const [error, setError] = useState<string | null>(null);

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
      const data = await loginApi(email, password); // { token, user } Appel vers l’API backend
      setTokenState(data.token);
      setUser(data.user);
      setToken(data.token); // Sauvegarde dans le localStorage
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fonction de déconnexion
  const logout = () => {
    setUser(null);
    setTokenState(null);
    removeToken(); // Suppression du token dans le localStorage
  };

  // 🔹 Valeur partagée dans tout le projet
  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Conteneur global qui peut stocker et partager les infos d’authentification.