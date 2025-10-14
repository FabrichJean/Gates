import useFetch from "http-react"
import { apiURL, token } from "../constant"
import type { Category } from "../components/CategoryAutoComplete"

function UseCategory() {
   return useFetch<Category[]>(apiURL+"/categories", {
           headers: { Authorization: `Bearer ${token()}` },
       })
}

export default UseCategory
