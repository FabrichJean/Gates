import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMangasEpisodesApi } from "../api/mangasEpisode";
import { parseTitlesFromAPI } from "../utils/mangaTitlesUtils";
import { MangaTitlesViewer } from "../components/MangaTitlesViewer";
import type { MangaTitles } from "../types/mangaTitles";

export interface MangasImage {
  id: number;
  image_id: string;
  episode_id: number;
  metadata: any | null;
  image_upload_status: boolean;
  s3_image_path: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  image_url: string;
  s3_image_url: string;
}

interface Episode {
  id: number;
  name: string;
  number: number;
  description?: string;
  titles?: string; // JSON string des titres multilingues
  images?: string[] | string;
  images_url?: string[];
  metadata?: any;
  mangasImages: MangasImage[]
  chapter?: {
    title: string;
    chapter_number: number;
  };
}

const MangasEpisodesPage: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chapterId) fetchEpisodes();
    // eslint-disable-next-line
  }, [chapterId]);

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const res = await getMangasEpisodesApi(Number(chapterId));
      setEpisodes(res.data?.data || res.data || []);
    } catch {
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Épisodes du chapitre</h2>
        <Link
          to={`/mangas/${mangaId}/chapters/${chapterId}/episodes/upload`}
          className="btn btn-primary btn-sm"
        >
          + Nouvel épisode
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun épisode. Créez-en un pour commencer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="card bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="card-body p-4">
                <h3 className="card-title text-lg font-bold">
                  Épisode {ep.number}
                </h3>
                {ep.titles ? (
                  <MangaTitlesViewer
                    titles={parseTitlesFromAPI(ep.titles)}
                    fallbackText={`${ep.name}${ep.description ? ` - ${ep.description}` : ''}`}
                    showDescription={true}
                    titleClassName="text-sm font-semibold text-gray-700 dark:text-gray-300"
                    descriptionClassName="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1"
                    titleAs="p"
                    descriptionAs="p"
                    allowViewAll={false}
                  />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {ep.name}
                    </p>
                    {ep.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {ep.description}
                      </p>
                    )}
                  </>
                )}
                {ep.images_url && ep.images_url.length > 0 && (
                  <div className="mt-2">
                    <img
                      src={ep.mangasImages[0].s3_image_url || ep.mangasImages[0].image_url}
                      alt={ep.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {ep.images_url.length} image(s)
                    </p>
                  </div>
                )}
                <div className="card-actions justify-end mt-3">
                  <Link
                    to={`/mangas/${mangaId}/chapters/${chapterId}/episodes/${ep.id}`}
                    className="btn btn-xs btn-outline"
                  >
                    Voir détails
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MangasEpisodesPage;
