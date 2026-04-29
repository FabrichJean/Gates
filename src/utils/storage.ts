export const setToken = (token: string) => localStorage.setItem("authToken", token);
export const getToken = () => localStorage.getItem("authToken");
export const removeToken = () => {
    localStorage.clear();
    sessionStorage.clear()
}