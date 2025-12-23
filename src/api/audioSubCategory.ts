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

/**
 * Get all audio sub-categories
 */
export const getAudioSubCategoriesApi = async (
  categoryId?: number
): Promise<AudioSubCategoriesResponse> => {
  const params = categoryId ? `?audio_category_id=${categoryId}` : "";
  const response = await fetch(`${apiURL}/audio-sub-categories${params}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio sub-categories: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get a single audio sub-category by ID
 */
export const getAudioSubCategoryByIdApi = async (id: number): Promise<AudioSubCategory> => {
  const response = await fetch(`${apiURL}/audio-sub-categories/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio sub-category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create a new audio sub-category
 */
export const createAudioSubCategoryApi = async (data: {
  name: string;
  audio_category_id: number;
  description?: string;
}): Promise<AudioSubCategory> => {
  const response = await fetch(`${apiURL}/audio-sub-categories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create audio sub-category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Update an audio sub-category
 */
export const updateAudioSubCategoryApi = async (
  id: number,
  data: Partial<AudioSubCategory>
): Promise<AudioSubCategory> => {
  const response = await fetch(`${apiURL}/audio-sub-categories/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update audio sub-category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Delete an audio sub-category
 */
export const deleteAudioSubCategoryApi = async (id: number): Promise<void> => {
  const response = await fetch(`${apiURL}/audio-sub-categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete audio sub-category: ${response.statusText}`);
  }
};
