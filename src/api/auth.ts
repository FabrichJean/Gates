import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

// 🔹 Configuration d'une instance axios réutilisable
const api = axios.create({
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the latest token to each request just before it is sent.
api.interceptors.request.use((config) => {
  try {
    const t = getToken();
    if (t) {
      if (!config.headers) config.headers = {} as any;
      config.headers["Authorization"] = `Bearer ${t}`;
    }
  } catch (err) {
    console.error("Erreur lors de la récupération du token :", err);
  }
  return config;
}, (error) => Promise.reject(error));

// 🔸 Login API
export const loginApi = async (identifier: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { identifier, password });
    return response.data; // { token, user }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};

// 🔸 Register API
export const registerApi = async (email: string, username: string, password: string) => {
  try {
    const res = await api.post("/auth/register", { email, username, password });
    return res.data; // ➜ { token, userType }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};

export const createUser = async (data: {username: string, email: string, password: string}) => {
  try {
    const res = await api.post("/auth/create", data);
    return res.data; // ➜ { token, userType }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};

// 🔸 Récupérer l'utilisateur courant (réhydratation)
export const getMeApi = async () => {
  try {
    const res = await api.get(`/auth`);
    return res.data; // ex: { role: 'superadmin', id, email, ... }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response && error.response.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Erreur de connexion au serveur");
  }
};
