import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const createPlateformSubCategoryApi = async (
  plateformId: number,
  subCategoryId: number
) =>
  await axios.post(
    `${apiURL}/plateform-subcategory`,
    { plateformId, subCategoryId },
    {
      headers,
    }
  );

export const getPlateformSubCategoriesApi = async (params?: any) =>
  await axios.get(`${apiURL}/plateform-subcategory`, {
    headers,
    params,
  });

// Get all subcategories for a given plateform (route: GET /plateform/:plateformId/subcategories)
export const getSubCategoriesForPlateformApi = async (plateformId: number) =>
  await axios.get(`${apiURL}/plateform-subcategory/plateform/${plateformId}/subcategories`, { headers });

export const getPlateformSubCategoryByIdApi = async (id: number) =>
  await axios.get(`${apiURL}/plateform-subcategory/${id}`, { headers });

export const updatePlateformSubCategoryApi = async (
  id: number,
  data: { plateformId?: number; subCategoryId?: number }
) => await axios.put(`${apiURL}/plateform-subcategory/${id}`, data, { headers });

export const deletePlateformSubCategoryApi = async (id: number) =>
  await axios.delete(`${apiURL}/plateform-subcategory/${id}`, { headers });
