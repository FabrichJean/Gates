import { useParams } from "react-router-dom";
import MangasChaptersPage from "../pages/MangasChaptersPage";

export default function MangaChaptersRouteWrapper() {
  const { mangaId } = useParams();
  const id = mangaId ? parseInt(mangaId, 10) : undefined;
  if (!id || isNaN(id)) return <div className="p-8 text-red-500">Manga ID invalide</div>;
  return <MangasChaptersPage />;
}