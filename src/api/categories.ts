import axios from "axios";
import { apiURL, token } from "../constant";

export async function createCastegoryApi(name: string) {
    return await axios.post(apiURL+'/categories', {name}, {
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

export async function deleteSubCategoryApi(id: number) {
    return await axios.delete(apiURL+'/sub-categories/'+id, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}