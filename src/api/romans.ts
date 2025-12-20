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