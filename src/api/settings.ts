import axios from "axios";
import { apiURL, token } from "../constant";

export type TSettings = {
    id?: string;
    system_code: string;
    mp4_path: string;
    image_path: string;
    cdn_url: string;
};

export function saveSettings(settings: TSettings) {
    return axios.post(apiURL+'/api/settings', settings, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    });
}