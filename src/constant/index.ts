import config from "../config/environment";

export const server = import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || "http://192.168.1.48:3000";

export const apiURL = config.apiUrl;
export const token = () => localStorage.getItem("authToken") || "";

export const SENDING_STORAGE_KEY = "vms:sending_videos";
export const PROCESSED_STORAGE_KEY = "vms:processed_videos";

export const translateServer = `${server}/translate-titles`
export const PAGE_SIZE = 20;




//----------------------------- API URLS PROD AND TEST -----------------------------

export const DEFAULT_LANG = "en";

// PROD
export const API_URL_CN = "http://192.168.1.79:6002/api/v1";
export const API_URL_YD = "http://192.168.1.79:3000/api/v1";

// TEST
export const API_URL_CN_TEST = "http://192.168.1.79:6001/api/v1";
export const API_URL_YD_TEST = "http://192.168.1.79:6004/api/v1";