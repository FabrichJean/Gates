import axios from "axios";
import { apiURL, token } from "../constant";

// Roman tag categories CRUD client
export async function getRomanTagCategoriesApi() {
  return await axios.get(`${apiURL}/roman/tag-category`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getRomanTagCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/roman/tag-category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createRomanTagCategoryApi(data: { name: string; meta?: any }) {
  return await axios.post(
    `${apiURL}/roman/tag-category`,
    { name: data.name, meta: data.meta ?? null },
    { headers: { Authorization: `Bearer ${token()}` } }
  );
}

export async function updateRomanTagCategoryApi(id: number, data: { name?: string; meta?: any | null }) {
  return await axios.put(`${apiURL}/roman/tag-category/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteRomanTagCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/roman/tag-category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export default {
  getRomanTagCategoriesApi,
  getRomanTagCategoryByIdApi,
  createRomanTagCategoryApi,
  updateRomanTagCategoryApi,
  deleteRomanTagCategoryApi,
};
