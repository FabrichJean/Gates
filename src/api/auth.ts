import axios from "axios";
import { apiURL } from "../constant";

// 🔹 Configuration d'une instance axios réutilisable
const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔸 Login API
export const loginApi = async (identifier: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { identifier, password });
    return response.data; // { token, user }
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};

// 🔸 Register API
export const registerApi = async (username: string, email: string, password: string) => {
  try {
    const res = await api.post("/auth/register", { email, username, password });
    return res.data; // ➜ { token, userType }
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};

// 🔸 Valider un utilisateur
export const validateUserApi = async (userId: number) => {
  try {
    const res = await api.put(`/auth/validate/${userId}`);
    return res.data; // { message }
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};

// 🔸 Supprimer un utilisateur (mise à jour isDeleted)
export const deleteUserApi = async (userId: number) => {
  try {
    const res = await api.delete(`/auth/users/${userId}`);
    return res.data; // { message }
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};