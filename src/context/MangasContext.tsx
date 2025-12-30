/* eslint-disable react-refresh/only-export-components, @typescript-eslint/no-explicit-any */
import { createContext, useContext, useMemo, useRef, useCallback, useEffect } from "react";
import { useMangaManagement } from "../hooks/useMangaManagement";

type MangaContextType = ReturnType<typeof useMangaManagement> | null;

export const MangasContext = createContext<MangaContextType>(null);

export const MangasProvider = ({ children }: { children: React.ReactNode }) => {
  const mm = useMangaManagement();
  const mmRef = useRef(mm);

  // Keep ref up-to-date so stable callbacks can call latest implementation
  useEffect(() => {
    mmRef.current = mm;
  }, [mm]);

  // Stable wrappers that reference the latest mm via ref
  const reFetch = useCallback((delay?: number) => mmRef.current?.reFetch(delay), []);
  const mutate = useCallback((updater?: any) => mmRef.current?.mutate(updater), []);
  const toggleDeleted = useCallback((id: number, status: boolean) => mmRef.current?.toggleDeleted(id, status), []);
  const sendManga = useCallback((id: number) => mmRef.current?.sendManga(id), []);
  const setPage = useCallback((p: number) => mmRef.current?.setPage(p), []);
  const setFilters = useCallback((f: any) => mmRef.current?.setFilters(f), []);

  // Memoize the context value so consumers only rerender when salient data changes
  const value = useMemo(() => ({
    page: mm.page,
    setPage,
    filters: mm.filters,
    setFilters,
    mangas: mm.mangas,
    total: mm.total,
    loading: mm.loading,
    uploadingIds: mm.uploadingIds,
    reFetch,
    mutate,
    toggleDeleted,
    sendManga,
  }), [
    mm.page,
    mm.filters,
    mm.mangas,
    mm.total,
    mm.loading,
    mm.uploadingIds,
    setPage,
    setFilters,
    reFetch,
    mutate,
    toggleDeleted,
    sendManga,
  ]);

  return <MangasContext.Provider value={value as unknown as MangaContextType}>{children}</MangasContext.Provider>;
};

export const useMangasContext = () => {
  const ctx = useContext(MangasContext);
  if (!ctx) throw new Error("useMangasContext must be used within a MangasProvider");
  return ctx;
};
