import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import type { Category } from "../components/CategoryAutoComplete"

function UseCategory() {
   return useFetch<Category[]>(apiURL + "/categories", {
      headers: { Authorization: `Bearer ${getToken()}` },
   }) 
}

export default UseCategory
