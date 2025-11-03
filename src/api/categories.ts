import axios from "axios";
import { apiURL, token } from "../constant";

export async function createCastegoryApi(name: string) {
    return await axios.post(apiURL+'/categories', {name}, {
        headers: {
            Authorization: `Bearer ${token()}`
        }
    })
}