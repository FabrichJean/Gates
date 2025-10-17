import useFetch from "http-react"
import { apiURL, token } from "../constant"
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "./useSubCategory";

export type TVideo = {
  id: number;
  user_id: number;
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
  // category: {
  //   id: number,
  //   "name": "Professional"
  // },
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
    headers: { Authorization: `Bearer ${token()}` },
    query: { status, page, search }
  })
}

export function UseVideo(id: string | number | undefined) {
  return useFetch<TVideo>(`${apiURL}/videos/${id}`, {
    headers: { Authorization: `Bearer ${token()}` },
  })
}