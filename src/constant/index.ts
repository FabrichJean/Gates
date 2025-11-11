// export const server = "http://localhost:3000"
export const server = "http://192.168.1.42:3000"
export const apiURL = server + "/api/v1";
export const token = () => localStorage.getItem("authToken") || "";

export const SENDING_STORAGE_KEY = "vms:sending_videos";
export const PROCESSED_STORAGE_KEY = "vms:processed_videos";