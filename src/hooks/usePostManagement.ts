import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts, sendPostsToWebApp, togglePostStatus } from "../api/posts";
import type { PostsResponse } from "../types/post";
import toast from "react-hot-toast";

export const usePostManagement = () => {
  const [page, setPage] = useState<number>(1);
  const [params, setParams] = useState<any>(null);
  const [data, setData] = useState<PostsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetching = useRef(false);
  const refetchTimeout = useRef<number | null>(null);
  const pendingRefetch = useRef(false);

  const fetch = useCallback(async (pageNumber = 1) => {
    try {
      setLoading(true);
      fetching.current = true;
      const res = await getPosts({ page: pageNumber });
      setData(res.data as PostsResponse);
      setPage(res.data?.page || pageNumber);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
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
    // fetch whenever page changes (includes initial mount)
    fetch(page);
    return () => {
      if (refetchTimeout.current) window.clearTimeout(refetchTimeout.current);
    };
  }, [page, fetch]);

  const mutate = async () => {
    await fetch(page);
  };

  const toWebapp = async (ids?: number[]) => {
    try {
      setLoading(true);
      await sendPostsToWebApp(ids ?? null);
      toast.success("Envoyé vers WebApp !");
      safeRefetch(400);
    } catch (err) {
      toast.error("Erreur lors de l'envoi vers WebApp");
    } finally {
      setLoading(false);
    }
  };
  
  const activate = async (id: number) => {
    try { await togglePostStatus(id); toast.success("Statut mis à jour !"); safeRefetch(400); }
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

export default usePostManagement;
