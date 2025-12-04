import axios from "axios";
import { getToken } from "../utils/storage";
import { apiURL } from "../constant";

// Fetch post tag categories
export async function getTagCategoriesPostApi() {
  const url = `${apiURL}/post-tag-category`;
  const token = getToken();
  return axios.get(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

// Create a post tag category
export async function createTagCategoryPostApi(payload: { name: string; meta?: any }) {
  const url = `${apiURL}/post-tag-category`;
  const token = getToken();
  return axios.post(url, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

// Delete a post tag category by id
export async function deleteTagCategoryPostApi(id: number) {
  const url = `${apiURL}/post-tag-category/${id}`;
  const token = getToken();
  return axios.delete(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
// Update a post tag category (PUT post-tag-category)
export async function updateTagCategoryPostApi(data: { id: number; name?: string; meta?: any | null }) {
  const url = `${apiURL}/post-tag-category/${data.id}`;
  const token = getToken();
  return axios.put(url, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
