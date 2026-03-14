import React, { createContext, useContext, useState, useCallback } from "react";
import type { VideoForApp } from "../api/videoForApp";
import { fetchVideoForAppList } from "../api/videoForApp";
import { buildVideoForAppListParams } from "../utils/videoForAppFilters";

interface AppVideosContextType {
  page: number;
  setPage: (p: number) => void;
  filters: Record<string, any>;
  setFilters: (f: Record<string, any>) => void;
  params: Record<string, any>;
  data: { videos: VideoForApp[]; total: number; limit: number } | null;
  loading: boolean;
  mutate: () => void;
  toWebapp: () => void;
  activate: () => void;
  send: () => void;
  reFetch: () => void;
}

const AppVideosContext = createContext<AppVideosContextType | undefined>(undefined);

export const useAppVideosContext = () => useContext(AppVideosContext);

export const AppVideosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
//  alert("hello world");

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [params] = useState<Record<string, any>>({});
  const [data, setData] = useState<{ videos: VideoForApp[]; total: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    const { params } = buildVideoForAppListParams({ filters, page });
    fetchVideoForAppList(params)
      .then(res => setData({ videos: res.videos, total: res.total, limit: res.limit }))
      .finally(() => setLoading(false));
  }, [page, filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dummy implementations for now
  const mutate = () => fetchData();
  const toWebapp = () => {};
  const activate = () => {};
  const send = () => {};
  const reFetch = () => fetchData();
  
  return (
    <AppVideosContext.Provider
      value={{ page, setPage, filters, setFilters, params, data, loading, mutate, toWebapp, activate, send, reFetch }}
    >
      {children}
    </AppVideosContext.Provider>
  );
};
