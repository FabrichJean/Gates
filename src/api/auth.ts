import { apiURL } from "../constant";

export const loginApi = async (email: string, password: string) => {
    const res = await fetch(apiURL+"/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Invalid credentials");
    return res.json(); // { token: string, user: object
}