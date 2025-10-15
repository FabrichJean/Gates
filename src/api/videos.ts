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
export async function uploadVideo(formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.post(apiURL + "/videos/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVideo(videoId: string | number, formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.put(apiURL + "/videos/" + videoId, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deletePerm(videoId: string | number): Promise<any> {
    return await axios.delete(apiURL + "/videos/" + videoId + '/permanently', {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token()}`,
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function archiveVideo(videoId: string | number): Promise<any> {
    return await axios.delete(apiURL + "/videos/" + videoId, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token()}`,
        }
    });
}

export async function uploadCover(videoId: string | number): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload-cover`, null, {
        headers: {
            Authorization: `Bearer ${token()}`,
        }
    });
}

export async function toggleStatus(videoId: string | number): Promise<void> {
    return await axios.put(`${apiURL}/videos/${videoId}/toggleStatus`, null, {
        headers: {
            Authorization: `Bearer ${token()}`,
        }
    });
}