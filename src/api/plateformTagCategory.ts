// api/plateformCategory.ts
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const addTagCategoryToPlateformApi = async (
  plateformId: number,
  categoryId: number
) =>
  await axios.post(
    `${apiURL}/plateform-category/add`,
    { plateformId, categoryId },
    {
      headers,
    }
  );

export const removeTagCategoryFromPlateformApi = async (
  plateformId: number,
  categoryId: number
) =>
  await axios.delete(
    `${apiURL}/plateform-category/${plateformId}/${categoryId}`,
    {
      headers,
    }
  );

export const removePlateformFromTagCategoryApi = async (
  categoryId: number,
  plateformId: number
) =>
  await axios.delete(
    `${apiURL}/plateform-category/${categoryId}/${plateformId}`,
    {
      headers,
    }
  );

export const getTagCategoriesByPlateformApi = async (plateformId: number) =>
  await axios.get(`${apiURL}/plateform-category/plateform/${plateformId}`, {
    headers,
  });

export const getPlateformsByTagCategoryApi = async (categoryId: number) =>
  await axios.get(`${apiURL}/plateform-category/category/${categoryId}`, {
    headers,
  });

export const clearTagCategoriesFromPlateformApi = async (plateformId: number) =>
  await axios.delete(`${apiURL}/plateform-category/plateform/${plateformId}/clear`, {
    headers,
  });

  export const clearTagSubCategoriesFromPlateformApi = async (plateformId: number) =>
  await axios.delete(`${apiURL}/plateform-subcategory/plateform/${plateformId}/clear`, {
    headers,
  });