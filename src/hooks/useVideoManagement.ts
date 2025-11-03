import { useEffect, useMemo, useState } from "react";
import { sendProcessing, toggleStatus, webApp } from "../api/videos";
import toast from "react-hot-toast";
import { UseVideosWithParams } from "./useVideos";
import useSocketSend from "./useSocketSend";
import useSocketCheckVideos from "./useSocketCheckVideos";
import { mapStatus } from "../utils/filter";
import { PROCESSED_STORAGE_KEY, SENDING_STORAGE_KEY } from "../constant";
import type { TFilter } from "../components/VideoFilters";

export const useVideoManagement = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<TFilter>({
    category_id: "",
    sub_category_id: "",
    user_id: "",
    isDeleted: "",
    upload_status: "",
    cover_upload_status: "",
    transfer_status: "",
    startedAt: "",
    endAt: "",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [params, setParams] = useState<any>(null);
  const { data, reFetch, mutate } = UseVideosWithParams(params);

  const [loading, setLoading] = useState<{
    id: number | undefined;
    type: "transc" | "upload" | "cover" | "webapp";
  }>();

  // 🔹 États persistants
  const [sendingIds, setSendingIds] = useState<Array<number>>(() => {
    try {
      const raw = localStorage.getItem(SENDING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [processedIds, setProcessedIds] = useState<Array<number>>(() => {
    try {
      const raw = localStorage.getItem(PROCESSED_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // 🔹 Lecture initiale du filtre sauvegardé
  useEffect(() => {
    const saved = localStorage.getItem("videos_filtered");
    if (!saved || saved === "undefined") return;
    try {
      const parsed = JSON.parse(saved);
      setFilters((prev) => ({ ...prev, ...parsed }));
    } catch (e) {
      console.warn("⚠️ Filtres corrompus :", e);
      localStorage.removeItem("videos_filtered");
    }
  }, []);

  // 🔹 Création mémoïsée des params
  const computedParams = useMemo(() => {
    const _ = {
      ...filters,
      isDeleted: mapStatus(filters.isDeleted),
      upload_status: mapStatus(filters.upload_status),
      cover_upload_status: mapStatus(filters.cover_upload_status),
      transfer_status: mapStatus(filters.transfer_status),
    };

    return { status: "all", page, ..._ };
  }, [filters, page]);

  // 🔹 Mise à jour de params quand computedParams change
  useEffect(() => {
    setParams(computedParams);
    localStorage.setItem('video_params', JSON.stringify(computedParams))
  }, [computedParams]);

  // 🔹 Gestion des IDs
  const addSendingId = (id: number) => {
    setSendingIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem(SENDING_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const removeSendingId = (id: number) => {
    setSendingIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem(SENDING_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addProcessedId = (id: number) => {
    setProcessedIds((prev) => {
      const next = Array.from(new Set([...prev, id]));
      localStorage.setItem(PROCESSED_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // 🔹 Sockets
  useSocketSend((videoId) => {
    const id = Number(videoId);
    removeSendingId(id);
    addProcessedId(id);
    reFetch();
  });

  useSocketCheckVideos((data) => {
    console.log("📋 Checking mis à jour pour la vidéo :", data.video_id);
    reFetch();
  });

  // 🔹 Actions
  const toWebapp = async () => {
    setLoading({ id: 0, type: "webapp" });
    try {
      await webApp();
      toast.success("Envoyé avec succès vers le WebApp !");
      reFetch();
    } catch {
      toast.error("Erreur lors de l'envoi !");
    } finally {
      setLoading(undefined);
    }
  };

  const activate = async (videoId: number) => {
    try {
      await toggleStatus(videoId);
      reFetch();
      toast.success("Statut modifié !");
    } catch {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const send = async (videoId: number) => {
    // if (sendingIds.includes(videoId) || processedIds.includes(videoId)) return;

    addSendingId(videoId);
    setLoading({ id: videoId, type: "transc" });

    try {
      const res = await sendProcessing(videoId);
      toast.success(res?.data?.message || "Deep upload workflow started");
      reFetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d'envoi !");
      removeSendingId(videoId);
    } finally {
      setLoading(undefined);
    }
  };

  return {
    // États
    page,
    setPage,
    filters,
    setFilters,
    params,
    data,
    loading,
    sendingIds,
    processedIds,
    
    // Actions
    reFetch,
    mutate,
    toWebapp,
    activate,
    send,
  };
};