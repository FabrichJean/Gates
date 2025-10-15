export const server = "http://0.0.0.0:3000"
export const apiURL = server + "/api/v1";
export const token = () => localStorage.getItem("authToken") || "";