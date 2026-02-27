import axios from "axios";
import { apiURL, token } from "../constant";

export async function createCastegoryApi(name: string) {
    return await axios.post(apiURL+'/categories', {name}, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function updateCategoryApi(id: number, name: string) {
    return await axios.put(apiURL+'/categories/'+id, {name}, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function deleteCategoryApi(id: number) {
    return await axios.delete(apiURL+'/categories/'+id, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function createSubCategoryApi(data : {name: string, category_id: number}) {
    return await axios.post(apiURL+'/sub-categories', data, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function updateSubCategoryApi(id: number, data : {name: string, category_id?: number}) {
    return await axios.put(apiURL+'/sub-categories/'+id, data, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function deleteSubCategoryApi(id: number) {
    return await axios.delete(apiURL+'/sub-categories/'+id, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function restoreCategoryApi(id: number) {
    return await axios.put(apiURL+'/categories/'+id, { isDeleted: false }, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}

export async function restoreSubCategoryApi(id: number) {
    return await axios.put(apiURL+'/sub-categories/'+id, { isDeleted: false }, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}