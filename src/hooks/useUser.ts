import useFetch from "http-react";
import { getToken } from "../utils/storage";
import { apiURL } from "../constant";

export default function useUser(id: number | string | undefined) {
    return useFetch(apiURL+`/auth/users/${id}`, {  
        headers: {
            'Authorization': `Bearer ${getToken()}`,
        }
    });
}