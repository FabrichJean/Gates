import useFetch from "http-react"
import { apiURL } from "../../constant"
import { getToken } from "../../utils/storage"
import type { TVideo } from "../useVideos";
import { useBotVideoManagement } from "./useBotVideoManagement";

export default function UseBotVideos(status?: 'all' | '0' | '1', page?: number, search?: string) {
  return useFetch<{ total: number, page: number, limit: number, videos: TVideo[] }>(apiURL + "/bot-videos", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query: { status, page, search }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function UseBotVideosWithParams(query: any) {
  return useFetch<{ total: number, page: number, limit: number, videos: TVideo[] }>(apiURL + "/bot-videos", {
    headers: { Authorization: `Bearer ${getToken()}` },
    query
  })
}

export function UseBotVideo(id: string | number | undefined) {
  return useFetch<TVideo>(id ? apiURL + "/bot-videos/" + id : "", {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

export function useNextBotVideo(currentId: string | number | undefined) {
  const params = JSON.parse(localStorage.getItem('bot_video_params') || '{}');

  const { data, loading } = useBotVideoManagement();

  const currentVideoIndex = data?.videos?.findIndex(vd => vd.id === Number(currentId));
  const hasNext = currentVideoIndex !== undefined && currentVideoIndex < (data?.videos?.length || 0) - 1;
  const hasPrev = currentVideoIndex !== undefined && currentVideoIndex > 0;

  return {
    loading, 
    nextVideo: data?.videos?.at(currentVideoIndex + 1)?.id || currentId,
    prevVideo: currentVideoIndex > 0 ? data?.videos?.at(currentVideoIndex - 1)?.id : currentId,
    hasNext,
    hasPrev
  }
}
