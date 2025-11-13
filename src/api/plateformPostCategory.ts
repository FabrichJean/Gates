import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const addPostCategoryToPlateformApi = async (
  plateformId: number,
  categoryId: number
) =>
  await axios.post(
    `${apiURL}/plateform-post-category/add`,
    { plateformId, categoryId },
    {
      headers,
    }
  );

export const removePostCategoryFromPlateformApi = async (
  plateformId: number,
  categoryId: number
) =>
  await axios.delete(
    `${apiURL}/plateform-post-category/${plateformId}/${categoryId}`,
    {
      headers,
    }
  );

export const getPostCategoriesByPlateformApi = async (plateformId: number) =>
  await axios.get(`${apiURL}/plateform-post-category/plateform/${plateformId}`, {
    headers,
  });

export const clearPostCategoriesFromPlateformApi = async (plateformId: number) =>
  await axios.delete(`${apiURL}/plateform-post-category/plateform/${plateformId}/clear`, {
    headers,
  });
