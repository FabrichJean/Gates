import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL, token } from "../constant";
import { deleteMangasEpisodeApi } from "../api/mangasEpisode";
import toast from "react-hot-toast";
import type { MangasImage } from "./MangasEpisodesPage";

interface Episode {
  id: number;
  name: string;
  number: number;
  description?: string;
  images?: string[] | string;
  images_url?: string[];
  metadata?: any;
  mangasImages: MangasImage[]
  chapter?: {
    title: string;
    chapter_number: number;
    manga_id: number;
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
        <h1 className="text-3xl font-bold">
          Épisode {episode.number}: {episode.name}
        </h1>
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

      {episode.description && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 dark:text-gray-300">{episode.description}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Images ({episode.images_url?.length || 0})</h2>
        {episode.images_url && episode.images_url.length > 0 ? (
          <div className="relative">
            {/* Image principale avec effet livre */}
            <div className="relative w-full max-w-3xl mx-auto">
              <div className="perspective-1000">
                <div 
                  className="relative bg-white dark:bg-gray-900 shadow-2xl rounded-lg overflow-hidden transition-transform duration-500"
                  style={{
                    transform: currentPage > 0 ? 'rotateY(-2deg)' : 'rotateY(0deg)',
                  }}
                >
                  <img
                    src={episode.mangasImages[currentPage].s3_image_url || episode.mangasImages[currentPage].image_url}
                    alt={`${episode.name} - Page ${currentPage + 1}`}
                    className="w-full h-auto object-contain"
                    style={{ maxHeight: '70vh' }}
                  />
                  
                  {/* Numéro de page */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentPage + 1} / {episode.images_url.length}
                  </div>
                </div>
              </div>
            </div>

            {/* Contrôles de navigation */}
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="btn btn-circle btn-outline"
                title="Page précédente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex gap-2">
                {episode.images_url.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentPage
                        ? 'bg-blue-500 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                    }`}
                    title={`Page ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(episode.images_url!.length - 1, p + 1))}
                disabled={currentPage === episode.images_url.length - 1}
                className="btn btn-circle btn-outline"
                title="Page suivante"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Navigation au clavier */}
            <div className="text-center mt-4 text-sm text-gray-500">
              Utilisez les flèches ← → du clavier pour naviguer
            </div>
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
