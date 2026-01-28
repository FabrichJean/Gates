import { useCallback, useEffect, useRef, useState } from "react";
import { getPostsForApp, sendPostsForAppToWebApp, togglePostForAppStatus } from "../api/postsForApp";
import type { PostsForAppResponse } from "../types/postForApp";
import toast from "react-hot-toast";

export const usePostForAppManagement = () => {
  const STORAGE_KEY = "posts_for_app_current_page";
  const [page, setPage] = useState<number>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      const n = v ? Number(v) : 1;
      return Number.isNaN(n) ? 1 : n;
    } catch (e) {
      return 1;
    }
  });
  const [params, setParams] = useState<any>(null);

  // Centralized filter state
  const [filters, _setFilters] = useState({
    category_id: "",
    sub_category_id: "",
    creator_id: "",
    startDate: "",
    endDate: "",
    user_id: "",
    isDeleted: "all",
    processing: "",
    uploaded: "all",
    page: "1",
    limit: "10",
    sort: "createdAt",
    order: "DESC",
  });
  // Memoize setFilters to avoid reference changes
  const setFilters = useCallback((updater: any) => {
    if (typeof updater === 'function') {
      return _setFilters((prev: any) => updater(prev));
    } else {
      return _setFilters(updater);
    }
  }, []);

  // Restore filters from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("posts_for_app_filtered");
      if (!saved) return;
      const savedFilter = JSON.parse(saved);
      // Convert 'yes'/'no' to true/false for all keys
      const normalized = Object.fromEntries(
        Object.entries(savedFilter).map(([k, v]) => {
          if (v === 'yes') return [k, true];
          if (v === 'no') return [k, false];
          return [k, v];
        })
      );
      // setFilters is defined above, so this is now correct
  setFilters((prev: any) => ({ ...prev, ...normalized }));
    } catch (e) {
      // ignore
    }
  }, [setFilters]);
  const [data, setData] = useState<PostsForAppResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  const fetching = useRef(false);
  const refetchTimeout = useRef<number | null>(null);
  const pendingRefetch = useRef(false);

  const fetch = useCallback(async (pageNumber = 1, customFilters = null) => {
    try {
      setLoading(true);
      fetching.current = true;
      // Normalize 'yes'/'no' to true/false for boolean filters
      const normalizeBool = (val: any) => {
        if (val === 'yes') return true;
        if (val === 'no') return false;
        return val;
      };
      const normalizedFilters = {
        ...filters,
        ...(customFilters || {}),
        isDeleted: normalizeBool((customFilters && customFilters.isDeleted !== undefined) ? customFilters.isDeleted : filters.isDeleted),
        processing: normalizeBool((customFilters && customFilters.processing !== undefined) ? customFilters.processing : filters.processing),
      };
      // Remove any filter with value 'all' from the params
      const params = Object.fromEntries(
        Object.entries({ ...normalizedFilters, page: pageNumber })
          .filter(([k, v]) => v !== 'all')
      );
      const res = await getPostsForApp(params);
      setData(res.data as PostsForAppResponse);
      setPage(res.data?.page || pageNumber);
    } catch (err: any) {
      console.error("Error fetching posts for app:", err);
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, [filters]);

  const safeRefetch = useCallback((delay = 500) => {
    if (fetching.current) {
      pendingRefetch.current = true;
      return;
    }
    if (refetchTimeout.current) window.clearTimeout(refetchTimeout.current);
    refetchTimeout.current = window.setTimeout(async () => {
      if (fetching.current) return;
      try {
        fetching.current = true;
        await fetch(page);
      } finally {
        fetching.current = false;
        if (pendingRefetch.current) {
          pendingRefetch.current = false;
          safeRefetch(delay);
        }
      }
    }, delay) as unknown as number;
  }, [fetch, page]);

  useEffect(() => {
    fetch(page);
    return () => {
      if (refetchTimeout.current) window.clearTimeout(refetchTimeout.current);
    };
  }, [page, fetch, filters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(page));
    } catch (e) {
      // ignore
    }
  }, [page]);

  const mutate = async () => {
    await fetch(page);
  };

  const toWebapp = async (ids?: number[]) => {
    try {
      setLoading(true);
      await sendPostsForAppToWebApp(ids ?? null);
      toast.success("Envoyé vers WebApp !");
      safeRefetch(400);
    } catch (err) {
      toast.error("Erreur lors de l'envoi vers WebApp");
    } finally {
      setLoading(false);
    }
  };

  const activate = async (id: number) => {
    try { await togglePostForAppStatus(id); toast.success("Statut mis à jour !"); safeRefetch(400); }
    catch { toast.error("Erreur lors du changement de statut"); }
  };

  return {
    page,
    setPage,
    params,
    setParams,
    data,
    loading,
    reFetch: safeRefetch,
    mutate,
    toWebapp,
    fetch,
    activate,
  filters,
  setFilters,
  };
};

export default usePostForAppManagement;