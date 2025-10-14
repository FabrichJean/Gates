import useFetch from "http-react"
import { apiURL } from "../constant"
import type { Category } from "../components/CategoryAutoComplete"

function UseCategory() {
   return useFetch<Category[]>(apiURL+"/categories")
}

export default UseCategory
