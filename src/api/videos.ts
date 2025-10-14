import axios from "axios";
import { apiURL, token } from "../constant";

export async function transcodeVideo(videoId: string | number | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/transcode`, null, {
        headers: {
            'Authorization': `Bearer ${token()}`
        }
    });
}

export async function uploadS3(videoId: string | number | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload`, null, {
        headers: {
            'Authorization': `Bearer ${token()}`
        }
    });
}