import axios from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

export interface AudioCategory {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AudioCategoriesResponse {
  data: AudioCategory[];
  total?: number;
}

const headers = () => ({ Authorization: `Bearer ${getToken()}` });

/**
 * Get all audio categories
 */
export const getAudioCategoriesApi = async (): Promise<AudioCategoriesResponse> => {
  return await axios.get(`${apiURL}/audio-categories`, { headers: headers() });
};

/**
 * Get a single audio category by ID
 */
export const getAudioCategoryByIdApi = async (id: number): Promise<AudioCategory> => {
  const { data } = await axios.get(`${apiURL}/audio-categories/${id}`, { headers: headers() });
  return data;
};

/**
 * Create a new audio category
 */
export const createAudioCategoryApi = async (payload: { name: string; description?: string; }): Promise<AudioCategory> => {
  const { data } = await axios.post(`${apiURL}/audio-categories`, payload, {
    headers: { ...headers(), "Content-Type": "application/json" },
  });
  return data;
};

/**
 * Update an audio category
 */
export const updateAudioCategoryApi = async (
  id: number,
  payload: Partial<AudioCategory>
): Promise<AudioCategory> => {
  const { data } = await axios.put(`${apiURL}/audio-categories/${id}`, payload, {
    headers: { ...headers(), "Content-Type": "application/json" },
  });
  return data;
};

/**
 * Delete an audio category
 */
export const deleteAudioCategoryApi = async (id: number): Promise<void> => {
  await axios.delete(`${apiURL}/audio-categories/${id}`, { headers: headers() });
};
