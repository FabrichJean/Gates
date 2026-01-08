import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

export interface AudioSubCategory {
  id: number;
  name: string;
  audio_category_id: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AudioSubCategoriesResponse {
  data: AudioSubCategory[];
  total?: number;
}

const headers = () => ({ Authorization: `Bearer ${getToken()}` });

/**
 * Get all audio sub-categories
 */
export const getAudioSubCategoriesApi = async (
  categoryId?: number
): Promise<AudioSubCategoriesResponse> => {
  const params = categoryId ? `?audio_category_id=${categoryId}` : "";
  return await axios.get(`${apiURL}/audio-subcategories${params}`, { headers: headers() });
};

/**
 * Get a single audio sub-category by ID
 */
export const getAudioSubCategoryByIdApi = async (id: number): Promise<AudioSubCategory> => {
  const { data } = await axios.get(`${apiURL}/audio-subcategories/${id}`, { headers: headers() });
  return data;
};

/**
 * Create a new audio sub-category
 */
export const createAudioSubCategoryApi = async (payload: {
  name: string;
  audio_category_id: number;
  description?: string;
}): Promise<AudioSubCategory> => {
  const { data } = await axios.post(`${apiURL}/audio-subcategories`, payload, {
    headers: { ...headers(), "Content-Type": "application/json" },
  });
  return data;
};

/**
 * Update an audio sub-category
 */
export const updateAudioSubCategoryApi = async (
  id: number,
  payload: Partial<AudioSubCategory>
): Promise<AudioSubCategory> => {
  const { data } = await axios.put(`${apiURL}/audio-subcategories/${id}`, payload, {
    headers: { ...headers(), "Content-Type": "application/json" },
  });
  return data;
};

/**
 * Delete an audio sub-category
 */
export const deleteAudioSubCategoryApi = async (id: number): Promise<void> => {
  await axios.delete(`${apiURL}/audio-subcategories/${id}`, { headers: headers() });
};
