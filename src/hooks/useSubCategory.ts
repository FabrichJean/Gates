import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"

export type SubCategory = {
   id: number;
   name: string;
   categoryId: string;
   createdAt: Date;
   updatedAt: Date;
}

function UseSubCategory(category_id: number) {
   return useFetch<{SubCategorys: SubCategory[]}>(apiURL + "/sub-categories", {
   headers: { Authorization: `Bearer ${getToken()}` },
      params: {
         category_id
      }
   })
}

export default UseSubCategory;
