import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Disc,
  Hash,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAudioAlbumsApi, deleteAudioAlbumApi } from "../api/audioAlbum";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

interface AudioAlbum {
  id: number;
  ref?: string;
  album_number?: number;
  total_tracks?: number;
  audio_id: number;
  user_id: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  audio?: {
    id: number;
    title: string;
    ref?: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

const AudioAlbums: React.FC = () => {
  const [albums, setAlbums] = useState<AudioAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleted, setShowDeleted] = useState(false);
  const itemsPerPage = 12;

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await getAudioAlbumsApi();
      setAlbums(response.data.data || []);
    } catch (error) {
      console.error("Error fetching audio albums:", error);
      toast.error("Erreur lors du chargement des albums");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // Filter albums based on search and deleted status
  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const matchesSearch =
        !searchTerm ||
        album.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.audio?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.audio?.ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        album.id.toString().includes(searchTerm);

      const matchesDeleted = showDeleted || !album.isDeleted;

      return matchesSearch && matchesDeleted;
    });
  }, [albums, searchTerm, showDeleted]);

  // Paginate albums
  const paginatedAlbums = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAlbums.slice(startIndex, endIndex);
  }, [filteredAlbums, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);

  const handleDelete = async (albumId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet album ?")) {
      return;
    }

    try {
      await deleteAudioAlbumApi(albumId);
      toast.success("Album supprimé avec succès");
      fetchAlbums();
    } catch (error) {
      console.error("Error deleting album:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Chargement des albums...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <Disc className="w-8 h-8 text-blue-600" />
                Albums Audio
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos albums audio et leurs pistes
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/audio-albums/upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                Nouvel Album
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Rechercher par référence, titre audio..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={showDeleted}
                  onChange={(e) => setShowDeleted(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-700"
                />
                {/* si l'album supprimé est afficher afficher cacher supprimés sinon Afficher supprimés */}
                {showDeleted ? "Cacher supprimés" : "Afficher supprimés"}
              </label>
            </div>
          </div>
        </motion.div>

        {/* Albums Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          {paginatedAlbums.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Disc className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                {searchTerm ? "Aucun album trouvé" : "Aucun album"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm
                  ? "Essayez de modifier vos critères de recherche"
                  : "Commencez par créer votre premier album"}
              </p>
              {!searchTerm && (
                <Link
                  to="/audio-albums/upload"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Créer un album
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {paginatedAlbums.map((album, index) => (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${
                      album.isDeleted
                        ? "border-red-200 dark:border-red-800 opacity-75"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {album.ref || `Album #${album.id}`}
                          </h3>
                          {album.audio && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                              {album.audio.title || album.audio.ref}
                            </p>
                          )}
                        </div>
                        {album.isDeleted && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                            Supprimé
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        {album.album_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Hash className="w-4 h-4" />
                            <span>Numéro: {album.album_number}</span>
                          </div>
                        )}

                        {album.total_tracks && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Music className="w-4 h-4" />
                            <span>
                              {album.total_tracks} piste
                              {album.total_tracks > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(album.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/audio-albums/${album.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Link>

                        <Link
                          to={`${album.isDeleted ? "#" : `/audio-albums/edit/${album.id}`}`}
                          className={`inline-flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 ${album.isDeleted ? `cursor-not-allowed` : `cursor-pointer`} dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        `}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(album.id)}
                          disabled={album.isDeleted}
                          className={`inline-flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30  text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors ${album.isDeleted ? `cursor-not-allowed` : `cursor-default`}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {filteredAlbums.length > itemsPerPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <Pagination
              totalItems={filteredAlbums.length}
              pageSize={itemsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          {filteredAlbums.length} album{filteredAlbums.length > 1 ? "s" : ""}{" "}
          trouvé{filteredAlbums.length > 1 ? "s" : ""}
          {searchTerm && ` pour "${searchTerm}"`}
        </motion.div>
      </div>
    </div>
  );
};

export default AudioAlbums;
