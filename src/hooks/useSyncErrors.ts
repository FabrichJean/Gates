import { useState, useEffect } from "react";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";

export interface SyncError {
    id: number;
    name: string;
    color: string;
    error_message?: string;
    created_at?: string;
    updated_at?: string;
}

export default function useSyncErrors() {
    const [data, setData] = useState<SyncError[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Mock data to return in case of API error
    const mockData: SyncError[] = [
        { 
            id: 1, 
            name: 'Apple MacBook Pro 17"', 
            color: 'Silver',
            error_message: 'Failed to sync product data',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 2, 
            name: 'Microsoft Surface Pro', 
            color: 'White',
            error_message: 'Timeout during synchronization',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        { 
            id: 3, 
            name: 'Magic Mouse 2', 
            color: 'Black',
            error_message: 'Invalid data format received',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
    ];

    const fetchSyncErrors = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${apiURL}/synchronize/errors_`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            });
            setData(response.data || []);
        } catch (err: any) {
            // setError(err);
            console.error("Failed to fetch sync errors:", err);
            // Return mock data in case of error
            console.warn("Using mock data due to API error");
            setData(mockData);
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