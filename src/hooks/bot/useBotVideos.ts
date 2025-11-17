import useFetch from "http-react"
import { apiURL } from "../../constant"
import { getToken } from "../../utils/storage"
import type { TVideo } from "../useVideos";

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
