// export const server = "http://192.168.1.97:3000"
export const server = "http://192.168.1.48:3000"
// export const server = "http://localhost:3000"
export const apiURL = server + "/api/v1";
export const token = () => localStorage.getItem("authToken") || "";

export const SENDING_STORAGE_KEY = "vms:sending_videos";
export const PROCESSED_STORAGE_KEY = "vms:processed_videos";

export const translateServer = `${server}/translate-titles`
export const PAGE_SIZE = 20;
