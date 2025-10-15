import useFetch from "http-react";
import { apiURL, token } from "../constant";
import type { TSettings } from "../api/settings";

export function useSettings() {
    return useFetch<{message : string, settings: TSettings}>(apiURL + "/settings", {
        headers: { Authorization: `Bearer ${token()}` },
    })
}