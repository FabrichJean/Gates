export const server = "http://localhost:3000"
// export const server = "http://172.18.224.1:3000"
export const apiURL = server + "/api/v1";
export const token = () => localStorage.getItem("authToken") || "";