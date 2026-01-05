import type { Audio, AudioListResponse } from "../types/audio";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

export interface AudioFilter {
  page?: number;
  limit?: number;
  search?: string;
  audio_category_id?: number;
  audio_sub_category_id?: number;
  creator_id?: number;
  plateform_id?: number;
  need_vip?: boolean;
  checking?: string;
  isDeleted?: boolean;
  startedAt?: string;
  endAt?: string;
  sort?: string;
  order?: "ASC" | "DESC";
}

/**
 * Get list of audios with filters and pagination
 */
export const getAudiosListApi = async (
  filters: AudioFilter = {}
): Promise<AudioListResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${apiURL}/audios?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audios: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get a single audio by ID
 */
export const getAudioByIdApi = async (id: string | number): Promise<Audio> => {
  const response = await fetch(`${apiURL}/audios/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Create a new audio
 */
export const createAudioApi = async (formData: FormData): Promise<Audio> => {
  const response = await fetch(`${apiURL}/audios`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to create audio: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Update an existing audio
 */
export const updateAudio = async (
  id: string | number,
  data: Partial<Audio> | FormData
): Promise<Audio> => {
  const isFormData = data instanceof FormData;

  const response = await fetch(`${apiURL}/audios/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update audio: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Delete an audio (soft delete by setting isDeleted)
 */
export const deleteAudioApi = async (
  id: string | number,
  isDeleted: boolean
): Promise<Audio> => {
  return updateAudio(id, { isDeleted });
};

/**
 * Upload audio to S3
 */
export const uploadAudioToS3 = async (
  id: string | number
): Promise<{ message: string }> => {
  const response = await fetch(`${apiURL}/audios/${id}/upload-s3`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload audio to S3: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Validate/check an audio (for admin approval)
 */
export const validateAudioApi = async (
  id: string | number,
  checking: "pending" | "approved" | "rejected",
  comment?: string
): Promise<Audio> => {
  return updateAudio(id, { checking, comment });
};
