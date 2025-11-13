import axios from 'axios';
import { apiURL } from '../constant';
import { getToken } from '../utils/storage';

export async function getCreators() {
  return await axios.get(`${apiURL}/creators`, {
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
