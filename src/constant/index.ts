export const server = "https://vmsapi.lolidao.fun"
// export const server = "http://192.168.1.201:3000"
export const apiURL = server + "/api/v1";
export const token = () => localStorage.getItem("authToken") || "";