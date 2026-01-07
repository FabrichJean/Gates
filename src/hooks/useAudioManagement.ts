import { useState, useCallback, useRef, useEffect } from "react";
import type { Audio, AudioFilter, AudioListResponse } from "../types/audio";
import {
  getAudiosListApi,
  updateAudio,
  uploadAudioToS3,
} from "../api/audios";
import isEqual from "lodash.isequal";
import { PAGE_SIZE } from "../constant";

interface UseAudioManagementReturn {
  audios: Audio[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  filters: AudioFilter;
  uploadingIds: Set<number>;
  setPage: (page: number) => void;
  setFilters: (filters: AudioFilter) => void;
  reFetch: () => Promise<void>;
  toggleDeleted: (id: number, currentDeletedState: boolean) => Promise<void>;
  sendAudio: (id: number) => Promise<void>;
  mutate: (updater: (audios: Audio[]) => Audio[]) => void;
}

const STORAGE_KEY_PARAMS = "audio_params";
const STORAGE_KEY_FILTERED = "audios_filtered";

export function useAudioManagement(): UseAudioManagementReturn {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIds, setUploadingIds] = useState<Set<number>>(new Set());
  
  const [filters, setFiltersState] = useState<AudioFilter>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_PARAMS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { page: 1, limit: PAGE_SIZE };
      }
    }
    return { page: 1, limit: PAGE_SIZE };
  });

  const refetchManagerRef = useRef<{
    pendingParams: AudioFilter | null;
    isRefetching: boolean;
  }>({
    pendingParams: null,
    isRefetching: false,
  });

  const fetchAudios = useCallback(
    async (params: AudioFilter) => {
      const manager = refetchManagerRef.current;

      // Si un refetch est en cours, sauvegarder les nouveaux params
      if (manager.isRefetching) {
        manager.pendingParams = params;
        return;
      }

      manager.isRefetching = true;
      setLoading(true);
      setError(null);

      try {
        const response: AudioListResponse = await getAudiosListApi(params);
        setAudios(response.data || []);
        setTotal(response.total || 0);
        setPage(params.page || 1);

        // Stocker les audios filtrés
        localStorage.setItem(STORAGE_KEY_FILTERED, JSON.stringify(response.data || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch audios");
        console.error("Error fetching audios:", err);
      } finally {
        setLoading(false);
        manager.isRefetching = false;

        // Si de nouveaux params sont arrivés pendant le refetch, relancer
        if (manager.pendingParams) {
          const nextParams = manager.pendingParams;
          manager.pendingParams = null;
          fetchAudios(nextParams);
        }
      }
    },
    []
  );

  // Fetch initial
  useEffect(() => {
    const params = { ...filters, page };
    fetchAudios(params);
  }, []);

  // Sync filters to localStorage
  useEffect(() => {
    const currentParams = { ...filters, page };
    const storedParams = localStorage.getItem(STORAGE_KEY_PARAMS);
    
    if (storedParams) {
      try {
        const parsed = JSON.parse(storedParams);
        if (!isEqual(parsed, currentParams)) {
          localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(currentParams));
        }
      } catch {
        localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(currentParams));
      }
    } else {
      localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(currentParams));
    }
  }, [filters, page]);

  // Refetch when page or filters change
  useEffect(() => {
    const params = { ...filters, page };
    const storedParams = localStorage.getItem(STORAGE_KEY_PARAMS);
    
    if (storedParams) {
      try {
        const parsed = JSON.parse(storedParams);
        if (!isEqual(parsed, params)) {
          fetchAudios(params);
        }
      } catch {
        fetchAudios(params);
      }
    } else {
      fetchAudios(params);
    }
  }, [filters, page, fetchAudios]);

  const reFetch = useCallback(async () => {
    const params = { ...filters, page };
    await fetchAudios(params);
  }, [filters, page, fetchAudios]);

  const setFilters = useCallback((newFilters: AudioFilter) => {
    setFiltersState(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const toggleDeleted = useCallback(
    async (id: number, currentDeletedState: boolean) => {
      try {
        const newState = !currentDeletedState;
        await updateAudio(id, { isDeleted: newState });

        // Update local state
        setAudios((prev) =>
          prev.map((audio) =>
            audio.id === id ? { ...audio, isDeleted: newState } : audio
          )
        );

        // Refetch to ensure consistency
        await reFetch();
      } catch (err) {
        console.error("Error toggling audio deleted state:", err);
        throw err;
      }
    },
    [reFetch]
  );

  const sendAudio = useCallback(
    async (id: number) => {
      setUploadingIds((prev) => new Set(prev).add(id));

      try {
        await uploadAudioToS3(id);

        // Update local state
        setAudios((prev) =>
          prev.map((audio) =>
            audio.id === id
              ? { ...audio, upload_status: "uploading" as const }
              : audio
          )
        );

        // Refetch after a delay to get updated status
        setTimeout(() => {
          reFetch();
          setUploadingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, 2000);
      } catch (err) {
        console.error("Error uploading audio to S3:", err);
        setUploadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        throw err;
      }
    },
    [reFetch]
  );

  const mutate = useCallback((updater: (audios: Audio[]) => Audio[]) => {
    setAudios(updater);
  }, []);

  return {
    audios,
    total,
    page,
    loading,
    error,
    filters,
    uploadingIds,
    setPage,
    setFilters,
    reFetch,
    toggleDeleted,
    sendAudio,
    mutate,
  };
}
