import { useEffect, useState } from "react";
import { fetchVideoForApp } from "../../api/videoForApp";
import type { VideoForApp } from "../../api/videoForApp";

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
  // Dummy implementation for navigation, adapt as needed
  return { nextVideo: null, prevVideo: null, hasNext: false, hasPrev: false };
}
