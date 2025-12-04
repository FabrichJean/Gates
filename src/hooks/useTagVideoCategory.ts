import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import type { TagCategoryItem } from "../api/tagCategory"

function useTagVideoCategory() {
   return useFetch<{items: TagCategoryItem[]}>(apiURL + "/tag-category", {
      headers: { Authorization: `Bearer ${getToken()}` },
   }) 
}

export default useTagVideoCategory;
