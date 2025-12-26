import axios from 'axios';
import { apiURL } from '../constant';

export interface VideoForApp {
  id: number;
  cn_title: string;
  en_title?: string;
  hi_title?: string;
  seconds: number;
  cover?: string;
  m3u8_path?: string;
  // ...other fields as needed
}

export interface VideoForAppListResponse {
  total: number;
  page: number;
  limit: number;
  search?: string;
  videos: VideoForApp[];
}

export async function fetchVideoForAppList(params: { page?: number; limit?: number; search?: string }) {
  const { data } = await axios.get<VideoForAppListResponse>(apiURL+'/videos-for-app', { params });
  return data;
}

export async function fetchVideoForApp(id: number) {
  const { data } = await axios.get<VideoForApp>(apiURL+`/videos-for-app/${id}`);
  return data;
}

export async function updateVideoForApp(id: number, payload: Partial<VideoForApp>) {
  const { data } = await axios.put<VideoForApp>(apiURL+`/videos-for-app/${id}`, payload);
  return data;
}
