import axios from "axios";
import { apiURL, token } from "../constant";

export type TSettings = {
    id?: string;
    system_code: string;
    mp4_storage_path: string;
    image_storage_path: string;
    cdn_url: string;
    server_url: string;
};

export function saveSettings(settings: TSettings) {
    return axios.put(apiURL+'/settings', settings, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    });
}