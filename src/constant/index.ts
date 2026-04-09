import config from "../config/environment";

export const server = import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || "http://0.0.0.0:3000";
export const apiURL = config.apiUrl;
export const token = () => localStorage.getItem("authToken") || "";

export const SENDING_STORAGE_KEY = "vms:sending_videos";
export const PROCESSED_STORAGE_KEY = "vms:processed_videos";

export const translateServer = `${server}/translate-titles`
export const PAGE_SIZE = 20;