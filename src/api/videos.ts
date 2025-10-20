import axios, { type AxiosProgressEvent } from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import { socket } from "../utils/socket";


export async function getFilteredVideos(params: any) {
    return await axios.get(`${apiURL}/videos`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        params
    })
}

export async function transcodeVideo(videoId: string | number | undefined, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/transcode`, null, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        onUploadProgress
    },);
}

export async function uploadS3(videoId: string | number | undefined): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload`, { socketId: socket.id }, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadVideo(formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.post(apiURL + "/videos/upload", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVideo(videoId: string | number, formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.put(apiURL + "/videos/" + videoId, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deletePerm(videoId: string | number): Promise<any> {
    return await axios.delete(apiURL + "/videos/" + videoId + '/permanently', {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function archiveVideo(videoId: string | number): Promise<any> {
    return await axios.delete(apiURL + "/videos/" + videoId, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function uploadCover(videoId: string | number): Promise<void> {
    return await axios.post(`${apiURL}/videos/${videoId}/upload-cover`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function toggleStatus(videoId: string | number): Promise<void> {
    return await axios.put(`${apiURL}/videos/${videoId}/toggleStatus`, null, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        }
    });
}

export async function webApp() {
    return await axios.post(`${apiURL}/videos/send-to-server`, null, {
        headers: {
            Authorization: `Bearer ${token()}`,
        }
    })
}