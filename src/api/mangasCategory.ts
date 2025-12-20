import axios from "axios";
import { apiURL, token } from "../constant";

export async function getMangasCategoriesApi() {
  return await axios.get(`${apiURL}/mangas-categories`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getMangasCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/mangas-categories/${id}` , {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createMangasCategoryApi(data: { name: string }) {
  return await axios.post(`${apiURL}/mangas-categories`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function updateMangasCategoryApi(id: number, data: { name?: string }) {
  return await axios.put(`${apiURL}/mangas-categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteMangasCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/mangas-categories/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}
