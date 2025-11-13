import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const createPlateformPostSubCategoryApi = async (
  plateformId: number,
  subCategoryId: number
) =>
  await axios.post(
    `${apiURL}/plateform-post-subcategory`,
    { plateformId, subCategoryId },
    {
      headers,
    }
  );

export const getPostSubCategoriesForPlateformApi = async (plateformId: number) =>
  await axios.get(`${apiURL}/plateform-post-subcategory/plateform/${plateformId}/subcategories`, { headers });

export const updatePlateformPostSubCategoryApi = async (
  id: number,
  data: { plateformId?: number; subCategoryId?: number }
) => await axios.put(`${apiURL}/plateform-post-subcategory/${id}`, data, { headers });

export const deletePlateformPostSubCategoryApi = async (id: number) =>
  await axios.delete(`${apiURL}/plateform-post-subcategory/${id}`, { headers });

export const clearPostSubCategoriesFromPlateformApi = async (plateformId: number) =>
  await axios.delete(`${apiURL}/plateform-post-subcategory/plateform/${plateformId}/clear`, { headers });
