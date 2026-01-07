import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { getMangasListApi } from "../api/mangasList";
import { updateManga, uploadMangaToS3 } from "../api/mangas";
import toast from "react-hot-toast";
import { PAGE_SIZE } from "../constant";
import isEqual from "lodash.isequal";
import type { Creator } from "../components/creators/CreatorList";

export interface MangaFilter {
  search?: string;
  category_id?: string;
  sub_category_id?: string;
  creator_id?: string;
  isDeleted?: string;
  processing?: string;
  need_vip?: string;
  checking?: string;
}

export interface Manga {
  id: number;
  ref: string;
  title?: string;
  description?: string;
  titles?: any;
  cover?: string;
  cover_url?: string;
  s3_cover_url?: string;
  creator?: string;
  creator_id?: number;
  creatorObj?: Creator;
  total_chapters?: number;
  need_vip?: boolean;
  isDeleted?: boolean;
  isBanned: boolean;
  checking?: string;
  comment?: string;
  processing?: string;
  mangasCategory?: { name: string };
  mangasSubCategory?: { name: string };
}

export interface MangaListResponse {
  data?: Manga[];
  count?: number;
  total?: number;
  limit?: number;
  page?: number;
}

export const useMangaManagement = () => {
  // Initialize from cached params
  const savedParams = (() => {
    try {
      const s = localStorage.getItem("manga_params");
      return s && s !== "undefined" ? { ...JSON.parse(s), page: undefined } : null;
    } catch {
      return null;
    }
  })();

  const [page, setPage] = useState<number>(() => savedParams?.page ?? 1);
  
  const defaultFilters: MangaFilter = {
    search: "",
    category_id: "",
    sub_category_id: "",
    creator_id: "",
    isDeleted: "",
    processing: "",
    need_vip: "",
    checking: "",
  };

  const [filters, setFilters] = useState<MangaFilter>(() => ({
    ...defaultFilters,
    ...(savedParams ? Object.keys(defaultFilters).reduce((acc, k) => {
      // @ts-ignore
      if (savedParams[k] !== undefined) acc[k] = savedParams[k];
      return acc;
    }, {} as any) : {})
  }));

  const [mangas, setMangas] = useState<Manga[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState<{ id?: number; type: string }>();
  const [uploadingIds, setUploadingIds] = useState<number[]>([]);

  // Load saved filters
  useEffect(() => {
    const saved = localStorage.getItem("mangas_filtered");
    if (!saved || saved === "undefined") return;
    try {
      setFilters(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      localStorage.removeItem("mangas_filtered");
    }
  }, []);

  // Computed params
  const computedParams = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    ...filters,
  }), [filters, page]);

  // Save params with deep compare
  useEffect(() => {
    const saved = localStorage.getItem("manga_params");
    const parsed = saved ? JSON.parse(saved) : null;

    if (!isEqual(parsed, computedParams)) {
      localStorage.setItem("manga_params", JSON.stringify(computedParams));
    }
  }, [computedParams]);

  // Refetch manager
  const refetching = useRef(false);
  const refetchTimeout = useRef<number | null>(null);
  const pendingRefetch = useRef(false);

  const fetchMangas = useCallback(async () => {
    if (refetching.current) {
      pendingRefetch.current = true;
      return;
    }

    try {
      refetching.current = true;
      setLoading({ type: "fetch" });
      
      const res = await getMangasListApi(computedParams);
      const data = res.data?.data;
      
      setMangas(data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching mangas:", err);
      setMangas([]);
      setTotal(0);
      toast.error("Erreur lors du chargement des mangas");
    } finally {
      setLoading(undefined);
      refetching.current = false;
      
      if (pendingRefetch.current) {
        pendingRefetch.current = false;
        safeRefetch(500);
      }
    }
  }, [computedParams]);

  const safeRefetch = useCallback((delay = 500) => {
    if (refetching.current) {
      pendingRefetch.current = true;
      return;
    }

    if (refetchTimeout.current) clearTimeout(refetchTimeout.current);

    refetchTimeout.current = window.setTimeout(() => {
      fetchMangas();
    }, delay);
  }, [fetchMangas]);

  // Initial fetch
  useEffect(() => {
    fetchMangas();
    return () => {
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
    };
  }, [page, fetchMangas]);

  // Actions
  const toggleDeleted = async (mangaId: number, currentStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append("isDeleted", String(!currentStatus));

      await updateManga(mangaId, formData);
      toast.success(
        currentStatus
          ? "Manga activé avec succès"
          : "Manga désactivé avec succès"
      );
      safeRefetch(400);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const sendManga = async (mangaId: number) => {
    // Check if already uploading
    if (uploadingIds.includes(mangaId)) {
      toast.error("Upload déjà en cours pour ce manga");
      return;
    }

    setUploadingIds(prev => [...prev, mangaId]);
    setLoading({ id: mangaId, type: "upload" });

    try {
      await uploadMangaToS3(mangaId);
      toast.success("Manga envoyé avec succès!");
      safeRefetch(500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'envoi du manga";
      toast.error(errorMessage);
    } finally {
      setLoading(undefined);
      setUploadingIds(prev => prev.filter(id => id !== mangaId));
    }
  };

  const mutate = useCallback((updater?: (current: Manga[]) => Manga[]) => {
    if (updater) {
      setMangas(updater);
    } else {
      safeRefetch(0);
    }
  }, [safeRefetch]);

  return {
    page,
    setPage,
    filters,
    setFilters,
    mangas,
    total,
    loading,
    uploadingIds,
    reFetch: safeRefetch,
    mutate,
    toggleDeleted,
    sendManga,
  };
};
