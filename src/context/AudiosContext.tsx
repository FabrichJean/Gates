import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useCallback,
} from "react";
import type { Audio, AudioFilter } from "../types/audio";
import { useAudioManagement } from "../hooks/useAudioManagement";

interface AudiosContextValue {
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

const AudiosContext = createContext<AudiosContextValue | null>(null);

export function AudiosProvider({ children }: { children: React.ReactNode }) {
  const audioManagement = useAudioManagement();

  // Stable refs for callbacks
  const reFetchRef = useRef(audioManagement.reFetch);
  const toggleDeletedRef = useRef(audioManagement.toggleDeleted);
  const sendAudioRef = useRef(audioManagement.sendAudio);
  const mutateRef = useRef(audioManagement.mutate);
  const setPageRef = useRef(audioManagement.setPage);
  const setFiltersRef = useRef(audioManagement.setFilters);

  // Update refs when callbacks change
  React.useEffect(() => {
    reFetchRef.current = audioManagement.reFetch;
    toggleDeletedRef.current = audioManagement.toggleDeleted;
    sendAudioRef.current = audioManagement.sendAudio;
    mutateRef.current = audioManagement.mutate;
    setPageRef.current = audioManagement.setPage;
    setFiltersRef.current = audioManagement.setFilters;
  }, [audioManagement]);

  // Stable callbacks
  const reFetch = useCallback(() => reFetchRef.current(), []);
  const toggleDeleted = useCallback(
    (id: number, currentDeletedState: boolean) =>
      toggleDeletedRef.current(id, currentDeletedState),
    []
  );
  const sendAudio = useCallback((id: number) => sendAudioRef.current(id), []);
  const mutate = useCallback(
    (updater: (audios: Audio[]) => Audio[]) => mutateRef.current(updater),
    []
  );
  const setPage = useCallback((page: number) => setPageRef.current(page), []);
  const setFilters = useCallback(
    (filters: AudioFilter) => setFiltersRef.current(filters),
    []
  );

  const value = useMemo(
    () => ({
      audios: audioManagement.audios,
      total: audioManagement.total,
      page: audioManagement.page,
      loading: audioManagement.loading,
      error: audioManagement.error,
      filters: audioManagement.filters,
      uploadingIds: audioManagement.uploadingIds,
      setPage,
      setFilters,
      reFetch,
      toggleDeleted,
      sendAudio,
      mutate,
    }),
    [
      audioManagement.audios,
      audioManagement.total,
      audioManagement.page,
      audioManagement.loading,
      audioManagement.error,
      audioManagement.filters,
      audioManagement.uploadingIds,
      setPage,
      setFilters,
      reFetch,
      toggleDeleted,
      sendAudio,
      mutate,
    ]
  );

  return (
    <AudiosContext.Provider value={value}>{children}</AudiosContext.Provider>
  );
}

export function useAudiosContext(): AudiosContextValue {
  const context = useContext(AudiosContext);
  if (!context) {
    throw new Error("useAudiosContext must be used within AudiosProvider");
  }
  return context;
}
