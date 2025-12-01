import { useState, useEffect } from "react";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";

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
    const [data, setData] = useState<SyncError[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchSyncErrors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${apiURL}/synchronize/errors`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            setData(response.data || []);
        } catch (err: any) {
            setError(err);
            console.error("Failed to fetch sync errors:", err);
            // Return mock data in case of error
            console.warn("Using mock data due to API error");
        } finally {
            setLoading(false);
        }
    };

    const reFetch = () => {
        fetchSyncErrors();
    };

    useEffect(() => {
        fetchSyncErrors();
    }, []);

    return { data, loading, error, reFetch } as const;
}