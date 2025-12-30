import axios from "axios";
import { apiURL, token } from "../constant";

export async function getRomanSubCategoriesApi() {
  return await axios.get(`${apiURL}/roman/sub-category/all`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getRomanSubCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/roman/sub-category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createRomanSubCategoryApi(data: { name: string; category_id: number }) {
  return await axios.post(`${apiURL}/roman/sub-category/add`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function updateRomanSubCategoryApi(id: number, data: { name?: string; category_id?: number }) {
  return await axios.put(`${apiURL}/roman/sub-category/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteRomanSubCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/roman/sub-category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}
