import UseVideos from "../../hooks/useVideos";

export function useProcessingCount() {
  // Récupère toutes les vidéos (statut all)
  const { data, loading } = UseVideos("all");
  const count = data?.videos?.filter(v => v.processing === "working").length || 0;
  return { count, loading };
}
