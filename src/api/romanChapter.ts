import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

/**
 * Get all roman chapters
 */
export async function getAllRomanChaptersApi() {
  return await axios.get(`${apiURL}/roman/chapters/all`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

/**
 * Get roman chapter by ID
 */
export async function getRomanChapterByIdApi(id: number | string) {
  return await axios.get(`${apiURL}/roman/chapters/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

/**
 * Get chapters by roman ID
 */
export async function getChaptersByRomanIdApi(romanId: number | string) {
  return await axios.get(`${apiURL}/roman/chapters/roman/${romanId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

/**
 * Create a new roman chapter
 */
export async function createRomanChapterApi(payload: {
  roman_id: number;
  chapter_number: number;
  isPublished?: boolean;
  titles?: Array<{ i18_language: string; title: string }>;
  contents?: Array<{ i18_language: string; content: string }>;
}) {
  return await axios.post(`${apiURL}/roman/chapters/add`, payload, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

/**
 * Update a roman chapter
 */
export async function updateRomanChapterApi(
  id: number | string,
  payload: {
    chapter_number?: number;
    isPublished?: boolean;
    titles?: Array<{ i18_language: string; title: string }>;
    contents?: Array<{ i18_language: string; content: string }>;
  }
) {
  return await axios.put(`${apiURL}/roman/chapters/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

/**
 * Delete a roman chapter
 */
export async function deleteRomanChapterApi(id: number | string) {
  return await axios.delete(`${apiURL}/roman/chapters/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}
