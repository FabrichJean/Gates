import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { activateVideoBot, sendVideoBotToServer, sendMultipleBotVideosToWebapp } from "../../api/videoBot";
import toast from "react-hot-toast";
import { UseBotVideosWithParams } from "./useBotVideos";
import useSocketSend from "../useSocketSend";
import useSocketCheckVideos from "../useSocketCheckVideos";
import { mapStatus } from "../../utils/filter";
import { PROCESSED_STORAGE_KEY, SENDING_STORAGE_KEY } from "../../constant";
import type { TFilter } from "../../components/VideoFilters";
import isEqual from "lodash.isequal";

export const useBotVideoManagement = () => {
  const savedParams = (() => {
    try {
      const s = localStorage.getItem("bot_video_params");
      return s && s !== "undefined" ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  })();

  const [page, setPage] = useState<number>(() => savedParams?.page ?? 1);
  const defaultFilters: TFilter = {
    category_id: "",
    sub_category_id: "",
    user_id: "",
    isDeleted: "",
    upload_status: "",
    cover_upload_status: "",
    transfer_status: "",
    startedAt: "",
    endAt: "",
  };

  const [filters, setFilters] = useState<TFilter>(() => ({
    ...defaultFilters,
    ...(savedParams ? Object.keys(defaultFilters).reduce((acc, k) => {
      // @ts-ignore
      if (savedParams[k] !== undefined) acc[k] = savedParams[k];
      return acc;
    }, {} as any) : {})
  }));

  const [params, setParams] = useState<any>(() => savedParams ?? null);
  const { data, reFetch, mutate } = UseBotVideosWithParams(params);

  const [loading, setLoading] = useState<{ id?: number; type: string }>();
  const [sendingIds, setSendingIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bot_" + SENDING_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [processedIds, setProcessedIds] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("bot_" + PROCESSED_STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem("bot_videos_filtered");
    if (!saved || saved === "undefined") return;
    try {
      setFilters(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      localStorage.removeItem("bot_videos_filtered");
    }
  }, []);

  const computedParams = useMemo(() => ({
    ...filters,
    isDeleted: mapStatus(filters.isDeleted),
    upload_status: mapStatus(filters.upload_status),
    cover_upload_status: mapStatus(filters.cover_upload_status),
    transfer_status: mapStatus(filters.transfer_status),
    status: "all",
    page,
  }), [filters, page]);

  useEffect(() => {
    const saved = localStorage.getItem("bot_video_params");
    const parsed = saved ? JSON.parse(saved) : null;

    if (!isEqual(parsed, computedParams)) {
      setParams(computedParams);
      localStorage.setItem("bot_video_params", JSON.stringify(computedParams));
    }
  }, [computedParams]);

  const refetching = useRef(false);
  const refetchTimeout = useRef<number | null>(null);
  const pendingRefetch = useRef(false);

  const safeRefetch = useCallback((delay = 500) => {
    if (refetching.current) {
      pendingRefetch.current = true;
      return;
    }

    if (refetchTimeout.current) clearTimeout(refetchTimeout.current);

    refetchTimeout.current = window.setTimeout(async () => {
      if (refetching.current) return;

      try {
        refetching.current = true;
        await reFetch();
      } finally {
        refetching.current = false;
        if (pendingRefetch.current) {
          pendingRefetch.current = false;
          safeRefetch(delay);
        }
      }
    }, delay);
  }, [reFetch]);

  useEffect(() => {
    if (!data) safeRefetch(500);
    return () => {
      if (refetchTimeout.current) clearTimeout(refetchTimeout.current);
    };
  }, [data, safeRefetch]);

  const persist = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));
  const addSendingId = (id: number) =>
    setSendingIds(prev => { const next = Array.from(new Set([...prev, id])); persist("bot_" + SENDING_STORAGE_KEY, next); return next; });
  const removeSendingId = (id: number) =>
    setSendingIds(prev => { const next = prev.filter(x => x !== id); persist("bot_" + SENDING_STORAGE_KEY, next); return next; });
  const addProcessedId = (id: number) =>
    setProcessedIds(prev => { const next = Array.from(new Set([...prev, id])); persist("bot_" + PROCESSED_STORAGE_KEY, next); return next; });

  useSocketSend((videoId) => {
    const id = Number(videoId);
    removeSendingId(id);
    addProcessedId(id);
    safeRefetch(700);
  });

  useSocketCheckVideos(() => safeRefetch(800));

  const [selectedPlatformIds, setSelectedPlatformIds] = useState<number[]>([]);
  const togglePlatformSelection = (id: number) =>
    setSelectedPlatformIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toWebapp = async (platformIds?: number[]) => {
    setLoading({ id: 0, type: "webapp" });
    try {
      const ids = platformIds ?? selectedPlatformIds;
      await sendMultipleBotVideosToWebapp(ids.length ? ids : []);
      toast.success("✅ Vidéos bot envoyées vers WebApp !");
      safeRefetch(400);
    } catch { toast.error("❌ Erreur d'envoi !"); } 
    finally { setLoading(undefined); }
  };

  const activate = async (videoId: number) => {
    try { await activateVideoBot(videoId); toast.success("Statut mis à jour !"); safeRefetch(400); }
    catch { toast.error("Erreur lors du changement de statut"); }
  };

  const send = async (videoId: number) => {
    addSendingId(videoId);
    setLoading({ id: videoId, type: "transc" });
    try {
      const res = await sendVideoBotToServer(videoId);
      toast.success(res?.message || "🚀 Upload bot démarré !");
      safeRefetch(500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur d'envoi !");
      removeSendingId(videoId);
    } finally { setLoading(undefined); }
  };

  return {
    page,
    setPage,
    filters,
    setFilters,
    params,
    data,
    loading,
    sendingIds,
    processedIds,
    selectedPlatformIds,
    setSelectedPlatformIds,
    togglePlatformSelection,
    reFetch: safeRefetch,
    mutate,
    toWebapp,
    activate,
    send,
  };
};
