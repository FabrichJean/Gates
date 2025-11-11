import { useState, useEffect } from 'react';
import axios from 'axios';

interface Language {
    id: number;
    name: string;
}

interface LanguageResponse {
    success: boolean;
    data: Language[];
    message?: string;
}

interface CreateLanguageRequest {
    name: string;
}

interface CreateLanguageResponse {
    success: boolean;
    data: Language;
    message?: string;
}

const useLanguagePost = () => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [createLoading, setCreateLoading] = useState<boolean>(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const fetchLanguages = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await axios.get<LanguageResponse>('/api/languages');
            
            if (response.data.success) {
                setLanguages(response.data.data);
            } else {
                setError(response.data.message || 'Failed to fetch languages');
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch languages');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const createLanguage = async (name: string): Promise<Language | null> => {
        setCreateLoading(true);
        setCreateError(null);
        
        try {
            const response = await axios.post<CreateLanguageResponse>('/api/languages', {
                name: name.trim()
            } as CreateLanguageRequest);
            
            if (response.data.success) {
                const newLanguage = response.data.data;
                setLanguages(prev => [...prev, newLanguage]);
                return newLanguage;
            } else {
                setCreateError(response.data.message || 'Failed to create language');
                return null;
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setCreateError(err.response?.data?.message || err.message || 'Failed to create language');
            } else {
                setCreateError('An unexpected error occurred');
            }
            return null;
        } finally {
            setCreateLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const refreshLanguages = () => {
        fetchLanguages();
    };

    return {
        languages,
        loading,
        error,
        createLanguage,
        createLoading,
        createError,
        refreshLanguages
    };
};

export default useLanguagePost;