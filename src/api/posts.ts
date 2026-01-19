import axios, { type AxiosProgressEvent } from "axios";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFilteredVideos(params: any) {
  return await axios.get(`${apiURL}/videos`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function uploadPost(
  formData: FormData,
  onUploadProgress: ((progressEvent: AxiosProgressEvent) => void) | undefined
): Promise<any> {
  return await axios.post(apiURL + "/posts/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${getToken()}`,
    },
    onUploadProgress,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPosts(params?: any) {
  const res = await axios.get(`${apiURL}/posts`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params,
  });
  return res;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPostsBot(params?: any) {
  const res = await axios.get(`${apiURL}/posts-bot`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params,
  });
  return res;
}

// Delete a post image by postId and imageId
export async function deletePostImage(imageId: number | string) {
  return await axios.delete(`${apiURL}/post-images/${imageId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

// Delete a post video by postId and videoId
export async function deletePostVideo(videoId: number | string) {
  return await axios.delete(`${apiURL}/post-videos/${videoId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export async function usePostProcessing({ id }: { id: number }) {
  return await axios.post(`${apiURL}/posts/${id}/deep-upload`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}
export async function cancelPostProcessing({ id }: { id: number }) {
  return await axios.post(`${apiURL}/posts/${id}/deep-upload/cancel`, null, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function sendPostsToWebApp(plateformIds?: number[] | null) {
  const data = plateformIds ? { plateformIds } : {};
  return await axios.post(`${apiURL}/posts/send-to-server`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function deleteManyVideos(ids: number[] ) {
  return await axios.post(`${apiURL}/post-videos/removeMany`, { ids }, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function deleteManyImages(ids: number[] ) { 
  return await axios.post(`${apiURL}/post-images/removeMany`, { ids }, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
}

export async function togglePostStatus(id: string | number): Promise<void> {
  return await axios.put(`${apiURL}/posts/${id}/toggleStatus`, null, {
      headers: {
          Authorization: `Bearer ${getToken()}`,
      }
  });
}

export async function togglePostBannedStatus(id: string | number): Promise<void> {
  return await axios.put(`${apiURL}/posts/${id}/toggle-banned`, null, {
      headers: {
          Authorization: `Bearer ${getToken()}`,
      }
  });
}

export async function updatePostBannedStatus(id: string | number, isBanned: boolean): Promise<void> {
  const formData = new FormData();
  formData.append('isBanned', String(isBanned));
  return await axios.put(`${apiURL}/posts/${id}`, formData, {
      headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
      }
  });
}

// Get posts for bulk sync (page 1 with limited results)
export async function getPostsForBulkSync(page: number = 1, limit: number = 50, plateformId?: number) {
  const params: any = {
    page,
    limit,
    select: 'id,title,status,cover,plateform_id', // Include plateform_id field
    progressing: 'done'
  };
  
  // Add plateformId filter if provided
  if (plateformId !== undefined && plateformId !== null) {
    params.plateform_id = plateformId;
  }
  
  return await axios.get(`${apiURL}/posts`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params
  });
}