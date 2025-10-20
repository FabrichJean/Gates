import useFetch from "http-react";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import type { TSettings } from "../api/settings";

export function useSettings() {
    return useFetch<{message : string, settings: TSettings}>(apiURL + "/settings", {
        headers: { Authorization: `Bearer ${getToken()}` },
    })
}