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

/**
 * Get all audio categories
 */
export const getAudioCategoriesApi = async (): Promise<AudioCategoriesResponse> => {
  const response = await fetch(`${apiURL}/audio-categories`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio categories: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get a single audio category by ID
 */
export const getAudioCategoryByIdApi = async (id: number): Promise<AudioCategory> => {
  const response = await fetch(`${apiURL}/audio-categories/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create a new audio category
 */
export const createAudioCategoryApi = async (data: {
  name: string;
  description?: string;
}): Promise<AudioCategory> => {
  const response = await fetch(`${apiURL}/audio-categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create audio category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Update an audio category
 */
export const updateAudioCategoryApi = async (
  id: number,
  data: Partial<AudioCategory>
): Promise<AudioCategory> => {
  const response = await fetch(`${apiURL}/audio-categories/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update audio category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Delete an audio category
 */
export const deleteAudioCategoryApi = async (id: number): Promise<void> => {
  const response = await fetch(`${apiURL}/audio-categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete audio category: ${response.statusText}`);
  }
};
