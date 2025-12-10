import useFetch from "http-react";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "./useSubCategory";
import type { Creator } from "./useCreators";

export type Checking = "null" | "waiting for checking" | "refused" | "checked";

export interface VideoTagCategory {
  id: number;
  video_id: number;
  tag_category_video_id: number;
  createdAt: string;
  updatedAt: string;
}

export type TVideo = {
  tagCategoryVideos: any;
  // Champs de votre type existant (prioritaires)
  id: number;
  user_id: number;
  checking: Checking;
  type: "1" | "2";
  comment: string;
  category: Category;
  subCategory: SubCategory;
  cover: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  duration: number | null;
  hls_url: string | null;
  isDeleted: boolean;
  ref: string;
  sequence: number | null;
  temp_url: string;
  titles: {
    id: any;
    title: string;
    i18_language: string;
    video_id: number;
    description?: string;
    language: { code: string; name: string };
  }[];
  transfer_status: number;
  upload_status: number;
  cover_upload_status: number;
  url: string | null;
  user: User;
  processing: "null" | "working" | "done";
  tagCategory: {
    id: number;
    name: string;
    meta: null;
    VideoTagCategory: VideoTagCategory;
  }[];
  nexts: TVideo[];

  // Champs supplémentaires de la base de données (ajoutés sans casser l'existant)
  category_id: number;
  sub_category_id: number | null;
  s3_hls_path: string | null;
  cdn_url: string | null;
  s3_cover_path: string | null;
  local_mp4_path: string | null;
  local_cover_path: string | null;
  local_hls_path: string | null;
  hash: string | null;
  sys_code: string | null;
  sendToServer: boolean;
  server_url: string | null;

  // HLS AES-128 encryption fields
  hls_key_db_id: number | null;
  hls_key_iv: string | null;

  public_urls: {
    temp_url: string;
    cover_url: string;
    hls_url: string;
    local_mp4_url: string;
    local_cover_url: string;
    local_hls_url: string;
  };

  s3_urls: {
    coverUrl: string;
    hlsUrl: string;
  };
  // optional creator string (free text)
  creator?: string | null;

  creatorObj: Creator;
};

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isValidated: boolean;
  isDeleted: boolean;
};

export default function UseVideos(
  status?: "all" | "0" | "1",
  page?: number,
  search?: string
) {
  return useFetch<{
    total: number;
    page: number;
    limit: number;
    videos: TVideo[];
  }>(apiURL + "/videos", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query: { status, page, search },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UseVideosWithParams(query: any) {
  return useFetch<{
    total: number;
    page: number;
    limit: number;
    videos: TVideo[];
  }>(apiURL + "/videos", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query,
  });
}

export function UseVideo(id: string | number | undefined) {
  return useFetch<TVideo>(`${apiURL}/videos/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
}

export function useNextVideo(currentId: string | number | undefined) {
  const params = JSON.parse(localStorage.getItem("video_params") || "");

  const { data, loading } = UseVideosWithParams(params);

  const currentVideoIndex = data?.videos?.findIndex(
    (vd) => vd.id === Number(currentId)
  );
  const hasNext =
    currentVideoIndex !== undefined &&
    currentVideoIndex < (data?.videos?.length || 0) - 1;
  const hasPrev = currentVideoIndex !== undefined && currentVideoIndex > 0;

  return {
    loading,
    nextVideo: data?.videos?.at(currentVideoIndex + 1)?.id || currentId,
    prevVideo:
      currentVideoIndex > 0
        ? data?.videos?.at(currentVideoIndex - 1)?.id
        : currentId,
    hasNext,
    hasPrev,
  };
}
