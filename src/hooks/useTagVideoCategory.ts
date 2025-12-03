import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import type { Category } from "../components/CategoryAutoComplete"

function useTagVideoCategory() {
   return useFetch<Category[]>(apiURL + "/tag-category", {
      headers: { Authorization: `Bearer ${getToken()}` },
   }) 
}

export default useTagVideoCategory;
