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
  const [data, setData] = useState<PostsForAppResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetching = useRef(false);
  const refetchTimeout = useRef<number | null>(null);
  const pendingRefetch = useRef(false);

  const fetch = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      fetching.current = true;
      const res = await getPostsForApp({ page: pageNumber });
      setData(res.data as PostsForAppResponse);
      setPage(res.data?.page || pageNumber);
    } catch (err: any) {
      console.error("Error fetching posts for app:", err);
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, []);

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
  }, [page, fetch]);

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
  };
};

export default usePostForAppManagement;