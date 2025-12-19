import axios from "axios";
import { apiURL, token } from "../constant";

export async function getMangasSubCategoriesApi() {
  return await axios.get(`${apiURL}/mangas-subcategories`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getMangasSubCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/mangas-subcategories/${id}` , {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createMangasSubCategoryApi(data: { name: string }) {
  return await axios.post(`${apiURL}/mangas-subcategories`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function updateMangasSubCategoryApi(id: number, data: { name?: string }) {
  return await axios.put(`${apiURL}/mangas-subcategories/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteMangasSubCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/mangas-subcategories/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}
