import useFetch from "http-react";
import type { Plateform } from "./usePlateform";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

export function usePlateformByCategory(categoryId: number) {
  return useFetch<Plateform[]>(apiURL + "/plateform-category/category/"+categoryId, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}
