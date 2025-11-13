import { useContext, useEffect, useState } from "react";
import { VideosContext } from "../context/VideosContext";
import { apiURL } from "../constant";
import { getToken } from "../utils/storage";

/**
 * Return the number of videos currently processing.
 *
 * Behavior:
 * - If a VideosProvider is mounted, read the count synchronously from context (no network call).
 * - If no provider is present, perform a single fetch (using fetch API) to get the videos list.
 *
 * Important: this hook calls the same hooks in the same order on every render to avoid
 * React "hooks order" errors.
 */
export function useProcessingCount() {
  const ctx = useContext(VideosContext);

  // state for fallback (when provider not mounted)
  const [fallbackCount, setFallbackCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if provider exists and has data, no need to fetch
    if (ctx && ctx.data) {
      setFallbackCount(null);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    fetch(`${apiURL}/videos`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const c = (data?.videos || []).filter((v: any) => v.processing === "working").length || 0;
        setFallbackCount(c);
      })
      .catch(() => {
        if (!mounted) return;
        setFallbackCount(0);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [ctx]);

  if (ctx && ctx.data) {
    const count = (ctx.data?.videos || []).filter((v: any) => v.processing === "working").length || 0;
    return { count, loading: ctx.loading };
  }

  return { count: fallbackCount ?? 0, loading };
}
