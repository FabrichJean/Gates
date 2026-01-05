import { useEffect, useState } from "react";
import { fetchVideoForApp } from "../../api/videoForApp";
import type { VideoForApp } from "../../api/videoForApp";
import { useVideoForAppContext } from "../../context/VideoForAppContext";

export function UseAppVideo(id?: string) {
  const [data, setData] = useState<VideoForApp | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchVideoForApp(Number(id))
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, reFetch: () => id && fetchVideoForApp(Number(id)).then(setData) };
}

export function useNextAppVideo(currentId?: string) {
  const ctx = useVideoForAppContext();
  const data = ctx?.data;

  console.log(data);
  

  const currentVideoIndex = data?.videos?.findIndex(
    (vd) => vd.id === Number(currentId)
  );
  const hasNext =
    currentVideoIndex !== undefined &&
    currentVideoIndex < (data?.videos?.length || 0) - 1;
  const hasPrev = currentVideoIndex !== undefined && currentVideoIndex > 0;

  return {
    loading: ctx?.loading,
    nextVideo: data?.videos?.at(currentVideoIndex + 1) || null,
    prevVideo:
      currentVideoIndex > 0
        ? data?.videos?.at(currentVideoIndex - 1)
        : null,
    hasNext,
    hasPrev,
  };
}
