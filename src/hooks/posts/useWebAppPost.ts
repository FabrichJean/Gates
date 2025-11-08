import { useState, useEffect } from 'react';
import axios from 'axios';

interface WebApp {
    id: number;
    name: string;
}

interface WebAppResponse {
    success: boolean;
    data: WebApp[];
    message?: string;
}

const useWebAppPost = () => {
    const [webApps, setWebApps] = useState<WebApp[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWebApps = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get<WebAppResponse>('/api/v1/webapps');
            
            if (response.data.success) {
                setWebApps(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch web applications');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch web applications');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebApps();
    }, []);

    const refreshWebApps = () => {
        fetchWebApps();
    };

    return {
        webApps,
        loading,
        error,
        refreshWebApps
    };
};

export default useWebAppPost;