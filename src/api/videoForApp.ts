import axios from "axios";
import { apiURL, token } from "../constant";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";

export interface Title {
    title: string;
    description?: string;
    i18_language: string;
    language: {
        code: string;
        name: string;
    };
}

export interface VideoForApp {
    id: number;
    cn_title: string;
    en_title?: string;
    hi_title?: string;
    seconds: number;
    creator_id?: number;
    plateform_id?: number;
    plateform?: { id: number; name: string };
    tag_category_ids?: (number | { name: string })[];
    categories?: (Category & {code : string})[];
    sub_categories?: (SubCategory & {code : string})[];
    tagCategoryVideos?: { id: number; name: string }[];
    cover?: string;
    need_vip?: boolean;
    m3u8_path?: string;
    type?: "1" | `2`;
    isBanned: boolean;
    creatorObj?: {
        id: number;
        name: string;
        avatar?: string;
    };
    createdAt?: string;
    checking?: string;
    public_urls: {
        temp_url: string;
        coverUrl: string;
        hls_url: string;
        local_mp4_url: string;
        local_cover_url: string;
        local_hls_url: string;
    };

    s3_urls: {
    coverUrl: string;
    hlsUrl: string;
    };
    titles: Title[];
  // ...other fields as needed
}

export interface VideoForAppListResponse {
  total: number;
  page: number;
  limit: number;
  search?: string;
  videos: VideoForApp[];
}

export interface VideoForAppListParams {
  page?: number | string;
  limit?: number;
  search?: string;
  creator_id?: number | string;
  category_id?: number | string;
  subcategory_id?: number | string;
  tag?: string;
  isDeleted?: boolean;
  checking?: string;
  type?: number | string;
  category?: string;
  subcategory?: string;
  duration_min?: number;
  duration_max?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export async function fetchVideoForAppList(params: VideoForAppListParams) {
  const { data } = await axios.get<VideoForAppListResponse>(
    apiURL + "/videos-for-app",
    {
      params,
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return data;
}

export async function fetchVideoForApp(id: number) {
  const { data } = await axios.get<VideoForApp>(
    apiURL + `/videos-for-app/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return data;
}

export async function updateVideoForApp(
  id: number,
  payload: Partial<VideoForApp>
) {
  return await axios.put<VideoForApp>(
    apiURL + `/videos-for-app/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
}

export async function activateVideoForApp(videoId: number) {
  const response = await axios.put(
    `${apiURL}/videos-for-app/${videoId}/toggleStatus`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return response.data;
}

export async function toggleVideoForAppBannedStatus(videoId: number) {
  const response = await axios.put(
    `${apiURL}/videos-for-app/${videoId}/toggle-banned`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return response.data;
}

export async function updateVideoForAppBannedStatus(videoId: number, isBanned: boolean) {
  const formData = {isBanned};
  const response = await axios.put(
    `${apiURL}/videos-for-app/${videoId}`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token()}`,
      },
    }
  );
  return response.data;
}

// Tag Category Videos API functions
export async function getTagCategoriesVideoForAppApi() {
  return await axios.get(`${apiURL}/tag-category/`, {
		headers: { Authorization: `Bearer ${token()}` },
	});
  
}

export async function createTagCategoryVideoForAppApi(data: { name: string; meta?: string | object }) {
  return await axios.post(
    `${apiURL}/video-for-app-tag-category`,
    { name: data.name, meta: data.meta ?? null },
    { headers: { Authorization: `Bearer ${token()}` } }
  );
}

export async function updateTagCategoryVideoForAppApi(id: number, data: { name?: string; meta?: string | object | null }) {
  return await axios.put(`${apiURL}/video-for-app-tag-category/${id}`, data, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function deleteTagCategoryVideoForAppApi(id: number) {
  return await axios.delete(`${apiURL}/video-for-app-tag-category/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
}

export async function getVideoForAppForBulkSync(page: number = 1, limit: number = 10, plateformId?: number) {
    const params: any = {
        page,
        limit,
        checking: 'checked',
        select: 'id,cn_title,en_title,status,cover,plateform_id', // Include plateform_id field
    };
    
    // Add plateformId filter if provided
    if (plateformId !== undefined && plateformId !== null) {
        params.plateform_id = plateformId;
    }
    
    return await axios.get(`${apiURL}/videos-for-app`, {
        headers: {
            Authorization: `Bearer ${token()}`,
        },
        params
    });
}
