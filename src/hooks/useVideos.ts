import useFetch from "http-react"
import { apiURL, token } from "../constant"
import type { Category } from "../components/CategoryAutoComplete";

export type TVideo = {
  id: number;
  user_id: number;
  category: Category;
  cover: string;
  createdAt: string;       // ISO date string
  updatedAt: string;       // ISO date string
  duration: number | null;
  hls_url: string | null;
  isDeleted: boolean;
  ref: string;
  sequence: number | null;
  temp_url: string;
  titles: { title: string; i18_language: string; video_id: number, language: {code: string, name: string} }[];
  transfer_status: number;
  upload_status: number;
  url: string | null;
};


export default function UseVideos() {
    return useFetch<{ videos: TVideo[] }>(apiURL + "/videos", {
        headers: { Authorization: `Bearer ${token()}` },
    })
}

export function UseVideo(id: string | number | undefined) {
    return useFetch<TVideo>(`${apiURL}/videos/${id}`, {
        headers: { Authorization: `Bearer ${token()}` },
    })
}