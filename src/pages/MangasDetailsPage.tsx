import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMangaById } from "../api/mangas";
import toast from "react-hot-toast";

interface Manga {
  id: number;
  ref: string;
  cover?: string;
  cover_url?: string;
  creator?: string;
  creator_id?: number;
  total_chapters?: number;
  need_vip?: boolean;
  mangas_category_id?: number;
  mangas_sub_category_id?: number;
  plateform_id?: number;
  createdAt?: string;
  updatedAt?: string;
  mangasCategory?: { id: number; name: string };
  mangasSubCategory?: { id: number; name: string };
  plateform?: { id: number; name: string };
  creatorObj?: { id: number; name: string; avatar?: string };
  tagCategories?: Array<{
    id: number;
    name: string;
    meta?: any;
    MangasTag?: any;
  }>;
  chapters?: Array<{
    id: number;
    title: string;
    chapter_number: number;
    description?: string;
  }>;
}

const MangasDetailsPage: React.FC = () => {
  const { mangaId } = useParams();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mangaId) fetchManga();
    // eslint-disable-next-line
  }, [mangaId]);

  const fetchManga = async () => {
    setLoading(true);
    try {
      const res = await getMangaById(Number(mangaId));
      setManga(res.data || res);
    } catch (error) {
      toast.error("Erreur lors du chargement du manga");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="p-8">
        <div className="alert alert-error">
          <span>Manga introuvable</span>
        </div>
        <Link to="/mangas" className="btn btn-primary mt-4">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header avec actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">{manga.ref}</h1>
        <div className="flex gap-3">
          <Link to="/mangas" className="btn btn-ghost">
            ← Retour
          </Link>
          <Link
            to={`/mangas/${manga.id}/edit`}
            className="btn btn-primary"
          >
            Éditer
          </Link>
          <Link
            to={`/mangas/${manga.id}/chapters`}
            className="btn btn-secondary"
          >
            Chapitres
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Image de couverture */}
        <div className="lg:col-span-1">
          <div className="card bg-base-200 shadow-xl">
            <figure className="px-4 pt-4">
              {manga.cover_url ? (
                <img
                  src={manga.cover_url}
                  alt={manga.ref}
                  className="rounded-xl w-full h-auto object-cover max-h-[500px]"
                />
              ) : (
                <div className="bg-base-300 rounded-xl w-full h-64 flex items-center justify-center">
                  <span className="text-base-content/50 text-lg">Pas d'image</span>
                </div>
              )}
            </figure>
            <div className="card-body">
              {manga.need_vip && (
                <div className="badge badge-warning badge-lg">VIP</div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite - Informations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Informations générales</h2>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <div className="badge badge-lg badge-primary">
                    ID: {manga.id}
                  </div>
                  <div className="badge badge-lg badge-info">
                    {manga.total_chapters || 0} chapitres
                  </div>
                </div>

                {manga.mangasCategory && (
                  <div>
                    <span className="font-semibold">Catégorie: </span>
                    <span className="badge badge-outline badge-lg">
                      {manga.mangasCategory.name}
                    </span>
                  </div>
                )}

                {manga.mangasSubCategory && (
                  <div>
                    <span className="font-semibold">Sous-catégorie: </span>
                    <span className="badge badge-outline">
                      {manga.mangasSubCategory.name}
                    </span>
                  </div>
                )}

                {manga.plateform && (
                  <div>
                    <span className="font-semibold">Plateforme: </span>
                    <span className="badge badge-outline">
                      {manga.plateform.name}
                    </span>
                  </div>
                )}

                {manga.creatorObj && (
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-semibold">Créateur: </span>
                    <div className="flex items-center gap-2">
                      {manga.creatorObj.avatar && (
                        <div className="avatar">
                          <div className="w-10 rounded-full">
                            <img src={manga.creatorObj.avatar} alt={manga.creatorObj.name} />
                          </div>
                        </div>
                      )}
                      <span className="text-lg">{manga.creatorObj.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {manga.tagCategories && manga.tagCategories.length > 0 && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {manga.tagCategories.map((tag) => (
                    <div key={tag.id} className="badge badge-primary badge-lg">
                      {tag.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chapitres récents */}
          {manga.chapters && manga.chapters.length > 0 && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl">Chapitres</h2>
                  <Link
                    to={`/mangas/${manga.id}/chapters`}
                    className="btn btn-sm btn-primary"
                  >
                    Voir tout
                  </Link>
                </div>
                <div className="space-y-2">
                  {manga.chapters.slice(0, 5).map((chapter) => (
                    <div
                      key={chapter.id}
                      className="flex justify-between items-center p-3 bg-base-300 rounded-lg hover:bg-base-100 transition"
                    >
                      <div>
                        <div className="font-semibold">
                          Chapitre {chapter.chapter_number}: {chapter.title}
                        </div>
                        {chapter.description && (
                          <div className="text-sm text-base-content/70 truncate">
                            {chapter.description}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/mangas/${manga.id}/chapters/${chapter.id}/edit`}
                        className="btn btn-sm btn-ghost"
                      >
                        Éditer
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Métadonnées */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Métadonnées</h2>
              <div className="space-y-2 text-sm">
                {manga.createdAt && (
                  <div>
                    <span className="font-semibold">Créé le: </span>
                    <span>{new Date(manga.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
                {manga.updatedAt && (
                  <div>
                    <span className="font-semibold">Modifié le: </span>
                    <span>{new Date(manga.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangasDetailsPage;
