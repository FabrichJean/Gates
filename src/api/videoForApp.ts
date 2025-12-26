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
    category_id?: number;
    sub_category_id?: number;
    categories?: (Category & {code : string})[];
    sub_categories?: (SubCategory & {code : string})[];
    cover?: string;
    m3u8_path?: string;
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

export async function fetchVideoForAppList(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
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
