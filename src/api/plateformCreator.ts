import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const addCreatorToPlateformApi = async (
  plateformId: number,
  creatorId: number
) =>
  await axios.post(
    `${apiURL}/plateform-creators/add`,
    { plateformId, creatorId },
    {
      headers,
    }
  );

export const removeCreatorFromPlateformApi = async (
  plateformId: number,
  creatorId: number
) =>
  await axios.delete(`${apiURL}/plateform-creators/${plateformId}/${creatorId}`, {
    headers,
  });

export const getCreatorsByPlateformApi = async (plateformId: number) =>
  await axios.get(`${apiURL}/plateform-creators/plateform/${plateformId}`, {
    headers,
  });

export const clearCreatorsFromPlateformApi = async (plateformId: number) =>
  await axios.delete(`${apiURL}/plateform-creators/plateform/${plateformId}/clear`, {
    headers,
  });
