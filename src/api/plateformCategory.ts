// api/plateformCategory.ts
import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const addCategoryToPlateformApi = async (
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

export const removeCategoryFromPlateformApi = async (
  categoryId: number,
  plateformId: number
) =>
  await axios.delete(
    `${apiURL}/plateform-category/${categoryId}/${plateformId}`,
    {
      headers,
    }
  );


  export const removePlateformFromCategoryApi = async (
  plateformId: number,
  categoryId: number,
) =>
  await axios.delete(
    `${apiURL}/plateform-category/${plateformId}/${categoryId}`,
    {
      headers,
    }
  );