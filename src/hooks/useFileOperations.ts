import { useState, useCallback } from 'react';
import filesAPI from '../api/files';
import type { 
  CreateFileRequest, 
  UpdateFileRequest, 
  UploadFileRequest,
  FileRecord 
} from '../types/file';
import { validateFileUpload } from '../utils/fileUtils';

interface OperationState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook for file CRUD operations (create, update, delete, upload)
 */
export function useFileOperations() {
  const [uploadState, setUploadState] = useState<OperationState>({
    isLoading: false,
    error: null,
    success: false
  });

  const [operationState, setOperationState] = useState<OperationState>({
    isLoading: false,
    error: null,
    success: false
  });

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(async (request: UploadFileRequest): Promise<FileRecord | null> => {
    // Validate file first
    console.log(request);
    
    const validation = validateFileUpload(request.file);
    if (!validation.isValid) {
      setUploadState({
        isLoading: false,
        error: validation.error || 'File validation failed',
        success: false
      });
      return null;
    }

    setUploadState({ isLoading: true, error: null, success: false });

    try {      
      const response = await filesAPI.uploadFile(request);
      
      setUploadState({
        isLoading: false,
        error: null,
        success: true
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        isLoading: false,
        error: errorMessage,
        success: false
      });
      return null;
    }
  }, []);

  /**
   * Upload multiple files
   */
  const uploadMultipleFiles = useCallback(async (
    requests: UploadFileRequest[]
  ): Promise<FileRecord[]> => {
    setUploadState({ isLoading: true, error: null, success: false });

    try {
      const results = await Promise.allSettled(
        requests.map(request => filesAPI.uploadFile(request))
      );

      const successful: FileRecord[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value.data);
        } else {
          errors.push(`File ${index + 1}: ${result.reason}`);
        }
      });

      if (errors.length > 0 && successful.length === 0) {
        setUploadState({
          isLoading: false,
          error: errors.join(', '),
          success: false
        });
      } else if (errors.length > 0) {
        setUploadState({
          isLoading: false,
          error: `Some uploads failed: ${errors.join(', ')}`,
          success: true
        });
      } else {
        setUploadState({
          isLoading: false,
          error: null,
          success: true
        });
      }

      return successful;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch upload failed';
      setUploadState({
        isLoading: false,
        error: errorMessage,
        success: false
      });
      return [];
    }
  }, []);

  /**
   * Create a file record without upload
   */
  const createFile = useCallback(async (request: CreateFileRequest): Promise<FileRecord | null> => {
    setOperationState({ isLoading: true, error: null, success: false });

    try {
      const response = await filesAPI.createFile(request);
      
      setOperationState({
        isLoading: false,
        error: null,
        success: true
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Create failed';
      setOperationState({
        isLoading: false,
        error: errorMessage,
        success: false
      });
      return null;
    }
  }, []);

  /**
   * Update a file record
   */
  const updateFile = useCallback(async (
    id: number, 
    request: UpdateFileRequest
  ): Promise<FileRecord | null> => {
    setOperationState({ isLoading: true, error: null, success: false });

    try {
      const response = await filesAPI.updateFile(id, request);
      
      setOperationState({
        isLoading: false,
        error: null,
        success: true
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setOperationState({
        isLoading: false,
        error: errorMessage,
        success: false
      });
      return null;
    }
  }, []);

  /**
   * Delete a single file
   */
  const deleteFile = useCallback(async (id: number): Promise<boolean> => {
    setOperationState({ isLoading: true, error: null, success: false });

    try {
      await filesAPI.deleteFile(id);
      
      setOperationState({
        isLoading: false,
        error: null,
        success: true
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setOperationState({
        isLoading: false,
        error: errorMessage,
        success: false
      });
      return false;
    }
  }, []);

  /**
   * Delete multiple files
   */
  const deleteMultipleFiles = useCallback(async (ids: number[]): Promise<number[]> => {
    setOperationState({ isLoading: true, error: null, success: false });

    try {
      const results = await Promise.allSettled(
        ids.map(id => filesAPI.deleteFile(id))
      );

      const successful: number[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(ids[index]);
        } else {
          errors.push(`File ${ids[index]}: ${result.reason}`);
        }
      });

      if (errors.length > 0 && successful.length === 0) {
        setOperationState({
          isLoading: false,
          error: errors.join(', '),
          success: false
        });
      } else if (errors.length > 0) {
        setOperationState({
          isLoading: false,
          error: `Some deletions failed: ${errors.join(', ')}`,
          success: true
        });
      } else {
        setOperationState({
          isLoading: false,
          error: null,
          success: true
        });
      }

      return successful;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch delete failed';
      setOperationState({
        isLoading: false,
        error: errorMessage,
        success: false
      });
      return [];
    }
  }, []);

  /**
   * Clear operation state
   */
  const clearState = useCallback(() => {
    setUploadState({ isLoading: false, error: null, success: false });
    setOperationState({ isLoading: false, error: null, success: false });
  }, []);

  return {
    // Upload operations
    uploadFile,
    uploadMultipleFiles,
    uploadState,
    
    // CRUD operations
    createFile,
    updateFile,
    deleteFile,
    deleteMultipleFiles,
    operationState,
    
    // Utilities
    clearState,
    
    // Combined state
    isLoading: uploadState.isLoading || operationState.isLoading,
    hasError: !!uploadState.error || !!operationState.error,
    error: uploadState.error || operationState.error,
    isSuccess: uploadState.success || operationState.success
  };
}