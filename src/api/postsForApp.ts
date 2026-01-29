import axios, { type AxiosProgressEvent } from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadPostForApp(
  formData: FormData,
  onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined
): Promise<any> {
  return await axios.post(apiURL + "/posts-for-app/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${getToken()}`,
    },
    onUploadProgress,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPostsForApp(params?: any) {
  const res = await axios.get(`${apiURL}/posts-for-app`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params,
  });
  return res;
}

// Delete a post image by postId and imageId
export async function deletePostForAppImage(imageId: number | string) {
  return await axios.delete(`${apiURL}/post-images/${imageId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

// Delete a post video by postId and videoId
export async function deletePostForAppVideo(videoId: number | string) {
  return await axios.delete(`${apiURL}/post-videos/${videoId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function usePostForAppProcessing({ id }: { id: number }) {
  return await axios.post(`${apiURL}/posts-for-app/${id}/deep-upload`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function cancelPostForAppProcessing({ id }: { id: number }) {
  return await axios.post(`${apiURL}/posts-for-app/${id}/deep-upload/cancel`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function sendPostsForAppToWebApp(plateformIds?: number[] | null) {
  const data = plateformIds ? { plateformIds } : {};
  return await axios.post(`${apiURL}/posts-for-app/send-to-server`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function deleteManyVideosForApp(ids: number[] ) {
  return await axios.post(`${apiURL}/post-videos/removeMany`, { ids }, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function deleteManyImagesForApp(ids: number[] ) {
  return await axios.post(`${apiURL}/post-images/removeMany`, { ids }, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function togglePostForAppStatus(id: string | number): Promise<void> {
  return await axios.put(`${apiURL}/posts-for-app/${id}/toggleStatus`, null, {
      headers: {
          Authorization: `Bearer ${getToken()}`,
      }
  });
}

export async function togglePostForAppBannedStatus(id: string | number): Promise<void> {
  return await axios.put(`${apiURL}/posts-for-app/${id}/toggle-banned`, null, {
      headers: {
          Authorization: `Bearer ${getToken()}`,
      }
  });
}

export async function updatePostForAppBannedStatus(id: string | number, isBanned: boolean): Promise<void> {
  return await axios.put(`${apiURL}/posts-for-app/${id}`, {isBanned}, {
      headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
      }
  });
}

export async function bulkUpdatePostsForApp(ids: number[], updateData: Record<string, any>) {
  return await axios.put(`${apiURL}/posts-for-app/update/multiple`, { ids, updateData }, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
}

// Get posts for bulk sync (page 1 with limited results)
export async function getPostsForAppForBulkSync(page: number = 1, limit: number = 50, plateformId?: number) {
  const params: any = {
    page,
    limit,
    select: 'id,title,status,cover,plateform_id', // Include plateform_id field
    checking: 'checked'
  };

  // Add plateformId filter if provided
  if (plateformId !== undefined && plateformId !== null) {
    params.plateform_id = plateformId;
  }

  return await axios.get(`${apiURL}/posts-for-app`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params
  });
}