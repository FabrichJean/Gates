import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";




export async function getFilteredRomans(params: any) {
    return await axios.get(`${apiURL}/romans/all`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        params
    })
}

export async function updateRoman(id: number | string | undefined, payload: any) {
    return await axios.put(`${apiURL}/romans/${id}/checking`, payload, {
        headers: {
            'Authorization': `Bearer ${getToken()}`
        }
    })
}

export async function addRoman(fd: FormData, onUploadProgress?: (progressEvent: any) => void) {
    return await axios.post(`${apiURL}/romans/add`, fd, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
}

export async function getRomanById(id: number | string | undefined) {
    return await axios.get(`${apiURL}/romans/${id}`, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        },
    });
}

export async function editRoman(id: number | string | undefined, fd: FormData, onUploadProgress?: (progressEvent: any) => void) {
    return await axios.put(`${apiURL}/romans/${id}`, fd, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    });
}

export async function toggleIsDeleted(id: number | string | undefined, isDeleted: boolean) {
    return await axios.put(`${apiURL}/romans/${id}/is-deleted`, { isDeleted }, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        },
    });
}

export async function deepUploadRoman(id: number | string | undefined) {
    return await axios.put(`${apiURL}/romans/${id}/deep-upload`, {}, {
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        },
    });
}