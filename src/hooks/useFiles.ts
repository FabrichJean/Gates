import { useState, useEffect, useCallback, useMemo } from 'react';
import filesAPI from '../api/files';
import type { FileListQuery, FileRecord, ApiResponse } from '../types/file';

interface UseFilesState {
  files: FileRecord[];
  pagination?: any;
  filters?: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook for fetching files with pagination, filtering, and caching
 */
export function useFiles(query: FileListQuery = {}) {
  const [state, setState] = useState<UseFilesState>({
    files: [],
    isLoading: false,
    isError: false,
    error: null
  });

  // Memoize the query to prevent unnecessary re-renders
  const memoizedQuery = useMemo(() => {
    return JSON.stringify(query);
  }, [
    query.page,
    query.limit,
    query.media_id,
    query.user_id,
    query.target_user,
    query.search,
    query.sortBy,
    query.sortOrder
  ]);

  const fetchFiles = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }));
    
    try {
      let response: ApiResponse<FileRecord[]>;
        // Use real API
        const parsedQuery = JSON.parse(memoizedQuery);
        response = await filesAPI.getFiles(parsedQuery);
      
      setState({
        files: response.data,
        pagination: response.pagination,
        filters: response.filters,
        isLoading: false,
        isError: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error as Error
      }));
    }
  }, [memoizedQuery]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const refetch = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  return {
    ...state,
    refetch,
    isFetching: state.isLoading
  };
}

/**
 * Hook for fetching a single file by ID
 */
export function useFile(id: number) {
  const [state, setState] = useState<{
    file?: FileRecord;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
  }>({
    isLoading: false,
    isError: false,
    error: null
  });

  const fetchFile = useCallback(async () => {
    if (!id) return;
    
    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }));
    
    try {
      const response = await filesAPI.getFile(id);
      setState({
        file: response.data,
        isLoading: false,
        isError: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error as Error
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  const refetch = useCallback(() => {
    fetchFile();
  }, [fetchFile]);

  return {
    ...state,
    refetch
  };
}

/**
 * Hook for fetching files by user (uploaded by user)
 */
export function useUserFiles(
  userId: number,
  query: { page?: number; limit?: number } = {}
) {
  const [state, setState] = useState<UseFilesState>({
    files: [],
    isLoading: false,
    isError: false,
    error: null
  });

  // Memoize the query to prevent unnecessary re-renders
  const memoizedQuery = useMemo(() => {
    return JSON.stringify({ userId, ...query });
  }, [userId, query.page, query.limit]);

  const fetchUserFiles = useCallback(async () => {
    const parsedQuery = JSON.parse(memoizedQuery);
    if (!parsedQuery.userId) return;
    
    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }));
    
    try {
      const { userId: uid, ...queryParams } = parsedQuery;
      const response = await filesAPI.getFilesByUser(uid, queryParams);
      setState({
        files: response.data,
        pagination: response.pagination,
        isLoading: false,
        isError: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error as Error
      }));
    }
  }, [memoizedQuery]);

  useEffect(() => {
    fetchUserFiles();
  }, [fetchUserFiles]);

  const refetch = useCallback(() => {
    fetchUserFiles();
  }, [fetchUserFiles]);

  return {
    ...state,
    refetch
  };
}

/**
 * Hook for fetching files targeted to a user
 */
export function useTargetedFiles(
  userId: number,
  query: { page?: number; limit?: number } = {}
) {
  const [state, setState] = useState<UseFilesState>({
    files: [],
    isLoading: false,
    isError: false,
    error: null
  });

  // Memoize the query to prevent unnecessary re-renders
  const memoizedQuery = useMemo(() => {
    return JSON.stringify({ userId, ...query });
  }, [userId, query.page, query.limit]);

  const fetchTargetedFiles = useCallback(async () => {
    const parsedQuery = JSON.parse(memoizedQuery);
    if (!parsedQuery.userId) return;
    
    setState(prev => ({ ...prev, isLoading: true, isError: false, error: null }));
    
    try {
      const { userId: uid, ...queryParams } = parsedQuery;
      const response = await filesAPI.getFilesForUser(uid, queryParams);
      setState({
        files: response.data,
        pagination: response.pagination,
        isLoading: false,
        isError: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        error: error as Error
      }));
    }
  }, [memoizedQuery]);

  useEffect(() => {
    fetchTargetedFiles();
  }, [fetchTargetedFiles]);

  const refetch = useCallback(() => {
    fetchTargetedFiles();
  }, [fetchTargetedFiles]);

  return {
    ...state,
    refetch
  };
}