import React, { createContext, useContext, useState, useCallback } from "react";
import type { VideoForApp } from "../api/videoForApp";
import { fetchVideoForAppList, activateVideoForApp } from "../api/videoForApp";
import toast from "react-hot-toast";

interface VideoForAppContextType {
  page: number;
  setPage: (p: number) => void;
  filters: Record<string, any>;
  setFilters: (f: Record<string, any>) => void;
  params: Record<string, any>;
  data: { videos: VideoForApp[]; total: number; limit: number; page?: number } | null;
  loading: boolean;
  mutate: () => void;
  toWebapp: () => void;
  activate: (videoId: number) => Promise<void>;
  send: () => void;
  reFetch: () => void;
  setData?: (d: { videos: VideoForApp[]; total: number; limit: number; page?: number } | null) => void;
}

const VideoForAppContext = createContext<VideoForAppContextType | undefined>(undefined);

export const useVideoForAppContext = () => useContext(VideoForAppContext);

export const VideoForAppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [params] = useState<Record<string, any>>({});
  const [data, setData] = useState<{ videos: VideoForApp[]; total: number; limit: number; page?: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetchVideoForAppList({ page, ...filters })
      .then(res => setData({ videos: res.videos, total: res.total, limit: res.limit, page: res.page ?? page }))
      .finally(() => setLoading(false));    
  }, [page, filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dummy implementations for now
  const mutate = () => fetchData();
  const toWebapp = () => {};
  const activate = async (videoId: number) => {
    try {
      await activateVideoForApp(videoId);
      toast.success("Statut mis à jour !");
      fetchData();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
      console.error("Error activating video for app:", error);
    }
  };
  const send = () => {};
  const reFetch = () => fetchData();

  return (
    <VideoForAppContext.Provider
      value={{ page, setPage, filters, setFilters, params, data, loading, mutate, toWebapp, activate, send, reFetch, setData }}
    >
      {children}
    </VideoForAppContext.Provider>
  );
};
