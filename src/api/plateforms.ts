import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

const headers = { Authorization: `Bearer ${getToken()}` };

export const createPlateformApi = async (data: any) =>
	await axios.post(
		`${apiURL}/plateform`,
		data,
		{
			headers,
		}
	);

export const getAllPlateformsApi = async () =>
	await axios.get(`${apiURL}/plateform`, { headers });

export const getPlateformByIdApi = async (id: number) =>
	await axios.get(`${apiURL}/plateform/${id}`, { headers });

export const updatePlateformApi = async (id: number, data: any) =>
	await axios.put(`${apiURL}/plateform/${id}`, data, { headers });

export const deletePlateformApi = async (id: number) =>
	await axios.delete(`${apiURL}/plateform/${id}`, { headers });




export async function webAppPlateform(plateformIds?: number[] | null) {
    // send platform ids in request body (supports multiple)
    const data = plateformIds ? { plateformIds } : {};
    return await axios.post(`${apiURL}/posts/send-to-server`, data, {
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    })
}