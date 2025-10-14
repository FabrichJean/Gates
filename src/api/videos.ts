import axios from "axios";
import { apiURL } from "../constant";

export async function transcodeVideo(videoId: string | number | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/transcode`);
}

export async function uploadS3(videoId: string | number | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload`);
}