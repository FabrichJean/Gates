import axios from "axios";
import { apiURL } from "../constant";

export async function transcodeVideo(videoId: number): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/transcode`);
}