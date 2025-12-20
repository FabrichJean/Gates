import React, { useEffect, useState } from "react";
import { getMangasListApi } from "../api/mangasList";
import { Link } from "react-router-dom";

interface Manga {
  id: number;
  ref: string;
  cover?: string;
  cover_url?: string;
  creator?: string;
  creator_id?: number;
  creatorObj?: { name: string; avatar?: string };
  total_chapters?: number;
  need_vip?: boolean;
  mangasCategory?: { name: string };
  mangasSubCategory?: { name: string };
}

const PAGE_SIZE = 10;

const Mangas: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMangas(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchMangas = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await getMangasListApi({ page: pageNum, limit: PAGE_SIZE });
      const data = res.data?.data || res.data || res;
      setMangas(data || []);
      setTotal(data.count || data.total || 0);
    } catch (err) {
      setMangas([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Mangas</h1>
      {loading ? (
        <div className="text-center py-8">Chargement...</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border">
            <table className="min-w-full bg-white dark:bg-gray-900">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">#</th>
                  <th className="px-4 py-2 border-b">Créateur</th>
                  <th className="px-4 py-2 border-b">ref</th>
                  <th className="px-4 py-2 border-b">Catégorie</th>
                  <th className="px-4 py-2 border-b">Chapitres</th>
                  <th className="px-4 py-2 border-b">VIP</th>
                  <th className="px-4 py-2 border-b">Cover</th>
                  <th className="px-4 py-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mangas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Aucun manga trouvé.</td>
                  </tr>
                ) : (
                  mangas.map((manga, idx) => (
                    <tr key={manga.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-2 border-b">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-2 border-b flex items-center gap-2">
                        {manga.creatorObj?.avatar && (
                          <img src={manga.creatorObj.avatar.startsWith('http') ? manga.creatorObj.avatar : `/${manga.creatorObj.avatar}`} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                        )}
                        {manga.creatorObj?.name || manga.creator || '-'}
                      </td>
                      <td className="px-4 py-2 border-b font-semibold">{manga.ref}</td>
                      <td className="px-4 py-2 border-b">{manga.mangasCategory?.name || '-'} / {manga.mangasSubCategory?.name || '-'}</td>
                      <td className="px-4 py-2 border-b text-center">{manga.total_chapters ?? '-'}</td>
                      <td className="px-4 py-2 border-b text-center">{manga.need_vip ? <span className="text-pink-600 font-bold">VIP</span> : '-'}</td>
                      <td className="px-4 py-2 border-b">
                        {manga.cover_url ? (
                          <img src={manga.cover_url} alt="cover" className="w-12 h-16 object-cover rounded shadow" />
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        <div className="flex gap-2 justify-center">
                          <Link
                            to={`/mangas/${manga.id}/edit`}
                            className="btn btn-xs btn-outline btn-primary"
                          >
                            Éditer
                          </Link>
                          <Link
                            to={`/mangas/${manga.id}/chapters`}
                            className="btn btn-xs btn-outline"
                          >
                            Chapitres
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <span className="mx-2">Page {page} / {totalPages}</span>
              <button
                className="btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Mangas;
