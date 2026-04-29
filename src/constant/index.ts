import config from "../config/environment";

export const server = config.apiUrl.replace(/\/api.*/, '');

export const apiURL = config.apiUrl;
export const token = () => localStorage.getItem("authToken") || "";

export const SENDING_STORAGE_KEY = "vms:sending_videos";
export const PROCESSED_STORAGE_KEY = "vms:processed_videos";

export const translateServer = `${server}/translate-titles`
export const PAGE_SIZE = 20;




//----------------------------- API URLS PROD AND TEST -----------------------------

export const DEFAULT_LANG = config.app.defaultUiLanguage;

// PROD
// export const API_URL_CN = "http://192.168.1.97:3006/api/v1";
// export const API_URL_YD = "http://192.168.1.97:3005/api/v1";

// TEST
export const API_URL_CN = config.app.apiYD;
export const API_URL_YD = config.app.apiCN;
