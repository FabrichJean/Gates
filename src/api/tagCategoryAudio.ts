import axios from "axios";
import { apiURL, token } from "../constant";

// Audio tag categories CRUD client
export async function getAudioTagCategoriesApi() {
  return await axios.get(`${apiURL}/audio-tag-categories`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getAudioTagCategoryByIdApi(id: number) {
  return await axios.get(`${apiURL}/audio-tag-categories/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function createAudioTagCategoryApi(data: { name: string; meta?: any }) {
  return await axios.post(
    `${apiURL}/audio-tag-categories`,
    { name: data.name, meta: data.meta ?? null },
    { headers: { Authorization: `Bearer ${token()}` } }
  );
}

export async function updateAudioTagCategoryApi(id: number, data: { name?: string; meta?: any | null }) {
  return await axios.put(`${apiURL}/audio-tag-categories/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteAudioTagCategoryApi(id: number) {
  return await axios.delete(`${apiURL}/audio-tag-categories/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export default {
  getAudioTagCategoriesApi,
  getAudioTagCategoryByIdApi,
  createAudioTagCategoryApi,
  updateAudioTagCategoryApi,
  deleteAudioTagCategoryApi,
};
