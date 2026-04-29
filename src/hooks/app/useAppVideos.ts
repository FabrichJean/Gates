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

  const currentVideoIndex = data?.videos?.findIndex(
    (vd) => String(vd.id) === String(currentId)
  );
  
  const validIndex = currentVideoIndex !== undefined && currentVideoIndex !== -1;
  const hasNext =
    validIndex &&
    currentVideoIndex < (data?.videos?.length || 0) - 1;
  const hasPrev = validIndex && currentVideoIndex > 0;

  return {
    loading: ctx?.loading,
    nextVideo: validIndex && hasNext ? data?.videos?.[currentVideoIndex + 1] || null : null,
    prevVideo: validIndex && hasPrev ? data?.videos?.[currentVideoIndex - 1] || null : null,
    hasNext,
    hasPrev,
  };
}
