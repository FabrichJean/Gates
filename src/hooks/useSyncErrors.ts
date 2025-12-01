import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import useFetch from "http-react";

export interface SyncError {
    id: number;
    entity: string;
    plateform_id: number;
    origin_id?: number | null;
    source_id?: number | null;
    resolved: boolean;
    createdAt?: string;
    updatedAt?: string;
    plateform?: {
        id: number;
        name: string;
        video_sync_url?: string;
        post_sync_url?: string;
    } | null;
}

export default function useSyncErrors() {
   return useFetch<SyncError[]>(apiURL + "/synchronize/errors", {
        headers: { Authorization: `Bearer ${getToken()}` },
    })
}