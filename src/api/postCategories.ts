import axios from "axios";
import { apiURL, token } from "../constant";

export async function createPostCategoryApi(name: string, creator?: string) {
    return await axios.post(apiURL + '/post-categories', { name, creator }, {
        headers: { Authorization: `Bearer ${token()}` }
    });
}

export async function updatePostCategoryApi(id: number, name: string, creator?: string) {
    return await axios.put(apiURL + '/post-categories/' + id, { name, creator }, {
        headers: { Authorization: `Bearer ${token()}` }
    });
}

export async function deletePostCategoryApi(id: number) {
    return await axios.delete(apiURL + '/post-categories/' + id, {
        headers: { Authorization: `Bearer ${token()}` }
    });
}

export async function createPostSubCategoryApi(data: { name: string; category_id: number; creator?: string }) {
    return await axios.post(apiURL + '/post-sub-categories', data, {
        headers: { Authorization: `Bearer ${token()}` }
    });
}

export async function updatePostSubCategoryApi(id: number, data: { name: string; category_id?: number; creator?: string }) {
    return await axios.put(apiURL + '/post-sub-categories/' + id, data, {
        headers: { Authorization: `Bearer ${token()}` }
    });
}

export async function deletePostSubCategoryApi(id: number) {
    return await axios.delete(apiURL + '/post-sub-categories/' + id, {
        headers: { Authorization: `Bearer ${token()}` }
    });
}
