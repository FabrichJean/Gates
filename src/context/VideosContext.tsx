/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-explicit-any */
import { createContext, useContext, useMemo, useRef, useCallback, useEffect } from "react";
import { useVideoManagement } from "../hooks/useVideoManagement";

type VideoContextType = ReturnType<typeof useVideoManagement> | null;

export const VideosContext = createContext<VideoContextType>(null);

export const VideosProvider = ({ children }: { children: React.ReactNode }) => {
  const vm = useVideoManagement();
  const vmRef = useRef(vm);

  // keep ref up-to-date so stable callbacks can call latest implementation
  useEffect(() => {
    vmRef.current = vm;
  }, [vm]);

  // stable wrappers that reference the latest vm via ref
  const reFetch = useCallback((delay?: number) => vmRef.current?.reFetch(delay), []);
  const mutate = useCallback((payload?: any, cb?: any) => vmRef.current?.mutate(payload, cb), []);
  const toWebapp = useCallback((platformIds?: number[]) => vmRef.current?.toWebapp(platformIds), []);
  const activate = useCallback((id: number) => vmRef.current?.activate(id), []);
  const send = useCallback((id: number) => vmRef.current?.send(id), []);
  const setPage = useCallback((p: number) => vmRef.current?.setPage(p), []);
  const setFilters = useCallback((f: any) => vmRef.current?.setFilters(f), []);
  const setSelectedPlatformIds = useCallback((ids: number[]) => vmRef.current?.setSelectedPlatformIds(ids), []);

  // memoize the context value so consumers only rerender when salient data changes
  const value = useMemo(() => ({
    page: vm.page,
    setPage,
    filters: vm.filters,
    setFilters,
    params: vm.params,
    data: vm.data,
    loading: vm.loading,
    sendingIds: vm.sendingIds,
    processedIds: vm.processedIds,
    selectedPlatformIds: vm.selectedPlatformIds,
    setSelectedPlatformIds,
    togglePlatformSelection: vm.togglePlatformSelection,
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
  }), [
    vm.page,
    vm.filters,
    vm.params,
    vm.data,
    vm.loading,
    vm.sendingIds,
    vm.processedIds,
    vm.selectedPlatformIds,
    setPage,
    setFilters,
    setSelectedPlatformIds,
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
    vm.togglePlatformSelection,
  ]);

  return <VideosContext.Provider value={value as unknown as VideoContextType}>{children}</VideosContext.Provider>;
};

export const useVideosContext = () => {
  const ctx = useContext(VideosContext);
  if (!ctx) throw new Error("useVideosContext must be used within a VideosProvider");
  return ctx;
};

