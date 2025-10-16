import { createContext } from "react";
import type { AuthContextType } from "./AuthContext";

// 🔸 Création du contexte (valeur par défaut = undefined)
export const AuthContext = createContext<AuthContextType | undefined>(undefined);