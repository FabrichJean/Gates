import useFetch from "http-react"
import { apiURL } from "../constant"
import { getToken } from "../utils/storage"
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "./useSubCategory";

export type Checking = "null" | "waiting for checking" | "refused" | "checked";

export type TVideo = {
  // Champs de votre type existant (prioritaires)
  id: number;
  user_id: number;
  checking: Checking;
  comment: string;
  category: Category;
  subCategory: SubCategory;
  cover: string;
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  duration: number | null;
  hls_url: string | null;
  isDeleted: boolean;
  ref: string;
  sequence: number | null;
  temp_url: string;
  titles: { title: string; i18_language: string; video_id: number, language: { code: string, name: string } }[];
  transfer_status: number;
  upload_status: number;
  cover_upload_status: number;
  url: string | null;
  user: User;

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
};

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isValidated: boolean;
  isDeleted: boolean;
}


export default function UseVideos(status?: 'all' | '0' | '1', page?: number, search?: string) {
  return useFetch<{ total: number, page: number, limit: number, videos: TVideo[] }>(apiURL + "/videos", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query: { status, page, search }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UseVideosWithParams(query: any) {
  return useFetch<{ total: number, page: number, limit: number, videos: TVideo[] }>(apiURL + "/videos", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query
  })
}

export function UseVideo(id: string | number | undefined) {
  return useFetch<TVideo>(`${apiURL}/videos/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
}