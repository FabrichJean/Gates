import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL, token } from "../constant";
import { deleteMangasEpisodeApi } from "../api/mangasEpisode";
import toast from "react-hot-toast";
import type { MangasImage } from "./MangasEpisodesPage";
import { parseTitlesFromAPI } from "../utils/mangaTitlesUtils";
import MangaTitlesViewer from "../components/MangaTitlesViewer";
import BookFlip from "../components/BookFlip";
import type { Manga } from "../hooks/useMangaManagement";
import { cdnS3 } from "../utils/cdn";

interface Episode {
  id: number;
  name: string;
  number: number;
  description?: string;
  titles?: string;
  images?: string[] | string;
  images_url?: string[];
  metadata?: any;
  mangasImages: MangasImage[]
  chapter?: {
    title: string;
    chapter_number: number;
    manga_id: number;
    manga: Manga
  };
}

const MangasEpisodeDetailsPage: React.FC = () => {
  const { mangaId, chapterId, episodeId } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (episodeId) fetchEpisode();
    // eslint-disable-next-line
  }, [episodeId]);

  // Navigation au clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!episode?.images_url) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentPage((p) => Math.max(0, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage((p) => Math.min(episode.images_url!.length - 1, p + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [episode]);

  const fetchEpisode = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiURL}/mangas/episodes/${episodeId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      setEpisode(res.data?.data || res.data);
    } catch {
      toast.error("Erreur lors du chargement de l'épisode");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  if (!episode) {
    return <div className="p-8 text-center text-red-500">Épisode introuvable</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        {episode.titles ? (
          <div className="flex-1">
            <MangaTitlesViewer 
              titles={parseTitlesFromAPI(episode.titles)} 
              fallbackText={`Épisode ${episode.number}: ${episode.name}${episode.description ? ` - ${episode.description}` : ''}`}
              titleClassName="text-3xl font-bold"
              descriptionClassName="text-gray-700 dark:text-gray-300 mt-2"
              showDescription={true}
              titleAs="h1"
              descriptionAs="p"
            />
          </div>
        ) : (
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              Épisode {episode.number}: {episode.name}
            </h1>
            {episode.description && (
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                {episode.description}
              </p>
            )}
          </div>
        )}
        <Link
          to={`/mangas/${mangaId}/chapters/${chapterId}/episodes`}
          className="btn btn-sm btn-outline"
        >
          ← Retour
        </Link>
      </div>

      {episode.chapter && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chapitre {episode.chapter.chapter_number}: {episode.chapter.title}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Images ({episode.images_url?.length || 0})</h2>
        {episode.images_url && episode.images_url.length > 0 ? (
          <div className="relative">
            {/* Image principale avec effet livre */}
            <BookFlip cover={cdnS3(episode.chapter.manga.s3_cover_url)} images={episode.mangasImages.map(i => cdnS3(i.s3_image_url) || i.image_url)}/>
          </div>
        ) : (
          <p className="text-gray-500">Aucune image disponible.</p>
        )}
      </div>

      {episode.metadata && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Metadata</h2>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(episode.metadata, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          to={`/mangas/${mangaId}/chapters/${chapterId}/episodes/${episodeId}/edit`}
          className="btn btn-primary"
        >
          Éditer
        </Link>
        <button
          onClick={async () => {
            if (confirm("Voulez-vous vraiment supprimer cet épisode ?")) {
              try {
                await deleteMangasEpisodeApi(Number(episodeId));
                toast.success("Épisode supprimé avec succès");
                navigate(`/mangas/${mangaId}/chapters/${chapterId}/episodes`);
              } catch (error) {
                toast.error("Erreur lors de la suppression de l'épisode");
              }
            }
          }}
          className="btn btn-error"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default MangasEpisodeDetailsPage;
