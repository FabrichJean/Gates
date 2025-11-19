/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-explicit-any */
import { createContext, useContext, useMemo, useRef, useCallback, useEffect } from "react";
import { useBotVideoManagement } from "../hooks/bot/useBotVideoManagement";

type BotVideoContextType = ReturnType<typeof useBotVideoManagement> | null;

export const BotVideosContext = createContext<BotVideoContextType>(null);

export const BotVideosProvider = ({ children }: { children: React.ReactNode }) => {
  const vm = useBotVideoManagement();
  const vmRef = useRef(vm);

  useEffect(() => {
    vmRef.current = vm;
  }, [vm]);

  const reFetch = useCallback((delay?: number) => vmRef.current?.reFetch(delay), []);
  const mutate = useCallback((payload?: any, cb?: any) => vmRef.current?.mutate(payload, cb), []);
  const toWebapp = useCallback((platformIds?: number[]) => vmRef.current?.toWebapp(platformIds), []);
  const activate = useCallback((id: number) => vmRef.current?.activate(id), []);
  const send = useCallback((id: number) => vmRef.current?.send(id), []);

  const value = useMemo(() => ({
    page: vm.page,
    setPage: vm.setPage,
    filters: vm.filters,
    setFilters: vm.setFilters,
    params: vm.params,
    data: vm.data,
    loading: vm.loading,
    sendingIds: vm.sendingIds,
    processedIds: vm.processedIds,
    selectedPlatformIds: vm.selectedPlatformIds,
    setSelectedPlatformIds: vm.setSelectedPlatformIds,
    togglePlatformSelection: vm.togglePlatformSelection,
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
  }), [
    vm.page,
    vm.setPage,
    vm.filters,
    vm.setFilters,
    vm.params,
    vm.data,
    vm.loading,
    vm.sendingIds,
    vm.processedIds,
    vm.selectedPlatformIds,
    vm.setSelectedPlatformIds,
    vm.togglePlatformSelection,
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
  ]);

  return <BotVideosContext.Provider value={value}>{children}</BotVideosContext.Provider>;
};

export const useBotVideosContext = () => {
  const ctx = useContext(BotVideosContext);
  return ctx;
};
