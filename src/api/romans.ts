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