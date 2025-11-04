import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import type { Category } from "../components/CategoryAutoComplete";
import { useEffect, useState } from "react";
import axios from "axios";

export type SubCategory = {
   id: number;
   name: string;
   categoryId: string;
   createdAt: Date;
   updatedAt: Date;
}

export default function UseSubCategory(category_id: number) {
   return useFetch<{ SubCategorys: SubCategory[] }>(apiURL + "/sub-categories", {
      headers: { Authorization: `Bearer ${getToken()}` },
      params: {
         category_id
      }
   })
}

export function UseSubCategoryReactive(category: Category) {
   const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

   const fetchSubCategories = async () => {
      try {
         const res = await axios.get<{ SubCategorys: SubCategory[] }>(
            `${apiURL}/sub-categories`,
            {
               headers: { Authorization: `Bearer ${getToken()}` },
               params: { category_id: category?.id },
            }
         );
         setSubCategories(res.data.SubCategorys);
      } catch (error) {
         console.error("Erreur lors du chargement des sous-catégories :", error);
      }
   };

   useEffect(() => {
      if (!category) {
         setSubCategories([]);
         return;
      }

      fetchSubCategories();
   }, [category]);

   return {data: subCategories, reFetch: fetchSubCategories}

}