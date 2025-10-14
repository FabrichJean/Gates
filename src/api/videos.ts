import axios, { type AxiosProgressEvent } from "axios";
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadVideo(formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined ): Promise<any> {
    return await axios.post(apiURL + "/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token()}`,
        },
        onUploadProgress,
      });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVideo(videoId: string | number, formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined ): Promise<any> {
    return await axios.put(apiURL + "/videos/" + videoId, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token()}`,
        },
        onUploadProgress,
      });
}