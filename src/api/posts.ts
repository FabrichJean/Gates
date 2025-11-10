import axios, { type AxiosProgressEvent } from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFilteredVideos(params: any) {
    return await axios.get(`${apiURL}/videos`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        params
    })
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadPost(formData: FormData, onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined): Promise<any> {
    return await axios.post(apiURL + "/posts/submit", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
        },
        onUploadProgress,
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPosts(params?: any) {
    return await axios.get(`${apiURL}/posts`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        params
    });
} 