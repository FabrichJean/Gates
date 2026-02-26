import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import type { Category } from "../components/CategoryAutoComplete"

function UseCategory(isDeleted = false) {
   const url = `${apiURL}/categories?isDeleted=${isDeleted}`
   return useFetch<Category[]>(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
   })
}

export default UseCategory
