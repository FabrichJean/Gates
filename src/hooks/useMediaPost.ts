// hooks/useMediaPost.ts
import { useState, useCallback } from 'react';

export interface UploadResponse {
  success: boolean;
  data?: {
    videoUrl: string;
    coverUrl: string;
    id: string;
  };
  error?: string;
}

export const useMediaPost = (apiEndpoint: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadCouple = useCallback(async (
    videoFile: File, 
    coverFile: File
  ): Promise<UploadResponse> => {
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('cover', coverFile);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  return { uploadCouple, isLoading, error };
};