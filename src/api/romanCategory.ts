import axios from "axios";
import { apiURL, token } from "../constant";

export async function getRomanCategoriesApi() {
  return await axios.get(`${apiURL}/roman/category/all`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getRomanCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/roman/category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createRomanCategoryApi(data: { name: string }) {
  return await axios.post(`${apiURL}/roman/category/add`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function updateRomanCategoryApi(id: number, data: { name?: string }) {
  return await axios.put(`${apiURL}/roman/category/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteRomanCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/roman/category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}
