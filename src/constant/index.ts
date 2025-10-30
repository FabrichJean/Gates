// export const server = "http://localhost:3000"
export const server = "http://192.168.1.157:3000"
export const apiURL = server + "/api/v1";
export const token = () => localStorage.getItem("authToken") || "";