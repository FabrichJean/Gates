import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"

export type Plateform = {
    id: number;
    name: string;
}

export default function UsePlateform() {
   return useFetch<Plateform[]>(apiURL + "/plateform", {
      headers: { Authorization: `Bearer ${getToken()}` },
   })
}