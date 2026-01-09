import axios from "axios";
import { apiURL, token } from "../constant";

// Manga tag categories CRUD client
export async function getMangaTagCategoriesApi() {
  return await axios.get(`${apiURL}/mangas-tag-categories`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getMangaTagCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/mangas-tag-categories/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createMangaTagCategoryApi(data: { name: string; meta?: any }) {
  return await axios.post(
    `${apiURL}/mangas-tag-categories`,
    { name: data.name, meta: data.meta ?? null },
    { headers: { Authorization: `Bearer ${token()}` } }
  );
}

export async function updateMangaTagCategoryApi(id: number, data: { name?: string; meta?: any | null }) {
  return await axios.put(`${apiURL}/mangas-tag-categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteMangaTagCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/mangas-tag-categories/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export default {
  getMangaTagCategoriesApi,
  getMangaTagCategoryByIdApi,
  createMangaTagCategoryApi,
  updateMangaTagCategoryApi,
  deleteMangaTagCategoryApi,
};
