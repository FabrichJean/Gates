import axios from 'axios';
import { apiURL } from '../constant';
import { getToken } from '../utils/storage';

export async function getCreators({isAll} : {isAll?: boolean} = {}) {
  return await axios.get(isAll ? `${apiURL}/creators/all` : `${apiURL}/creators`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function createCreator(formData: FormData) {
  return await axios.post(`${apiURL}/creators`, formData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function updateCreator(id: number, formData: FormData) {
  return await axios.put(`${apiURL}/creators/${id}`, formData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function deleteCreator(id: number) {
  return await axios.delete(`${apiURL}/creators/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

// Get creators for bulk sync
export async function getCreatorsForBulkSync(page: number = 1, limit: number = 50, plateformId?: number) {
  const params: any = {
    page,
    limit,
    select: 'id,name,status,avatar,plateform_id', // Include plateform_id field
  };
  
  // Add plateformId filter if provided
  if (plateformId !== undefined && plateformId !== null) {
    params.plateform_id = plateformId;
  }
  
  return await axios.get(`${apiURL}/creators`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params
  });
}
