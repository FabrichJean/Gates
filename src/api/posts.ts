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

// Delete a post image by postId and imageId
export async function deletePostImage(imageId: number | string) {
    return await axios.delete(`${apiURL}/post-images/${imageId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
}

// Delete a post video by postId and videoId
export async function deletePostVideo(videoId: number | string) {
    return await axios.delete(`${apiURL}/post-videos/${videoId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
}


export async function usePostProcessing({id}: {id: number}) {
    return await axios.post(`${apiURL}/posts/${id}/deep-upload`, null, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
    });
}
export async function cancelPostProcessing({id}: {id: number}) {
    return await axios.post(`${apiURL}/posts/${id}/deep-upload/cancel`, null, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
    });
}


export async function sendPostsToWebApp(plateformIds?: number[] | null) {
    const data = plateformIds ? { plateformIds } : {};
    return await axios.post(`${apiURL}/posts/send-to-server`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
}