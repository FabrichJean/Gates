import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Eye, 
  BookOpen, 
  Image as ImageIcon,
  Tag,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMangasListApi } from "../api/mangasList";
import { updateManga } from "../api/mangas";
import toast from "react-hot-toast";
import MangaChecking from "../components/MangaChecking";

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
  isDeleted?: boolean;
  checking?: string;
  comment?: string;
  mangasCategory?: { name: string };
  mangasSubCategory?: { name: string };
}

const PAGE_SIZE = 12;

const SexyLoader = () => (
  <div className="relative w-16 h-16 mx-auto">
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 animate-pulse" />
    <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-white/80 animate-spin" />
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-white rounded-full shadow-lg"
        style={{
          top: '50%',
          left: '50%',
          transform: `rotate(${i * 120}deg) translateX(120%)`,
          animation: `orbit 1.5s linear infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

const Mangas: React.FC = () => {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVIP, setFilterVIP] = useState<boolean | null>(null);
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetchMangas(page);
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
      toast.error("Erreur lors du chargement des mangas");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDeleted = async (mangaId: number, currentStatus: boolean) => {
    try {
      const formData = new FormData();
      formData.append("isDeleted", String(!currentStatus));
      
      await updateManga(mangaId, formData);
      toast.success(currentStatus ? "Manga activé avec succès" : "Manga désactivé avec succès");
      fetchMangas(page);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Filtrage côté client
  const filteredMangas = mangas.filter(manga => {
    const matchesSearch = manga.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manga.creatorObj?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manga.mangasCategory?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVIP = filterVIP === null || manga.need_vip === filterVIP;
    const matchesStatus = filterStatus === null || manga.isDeleted === !filterStatus;
    
    return matchesSearch && matchesVIP && matchesStatus;
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-gray-900 dark:text-gray-100"
              >
                Bibliothèque de Mangas
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez votre collection de mangas
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <Link
                to="/mangas/upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Nouveau Manga
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un manga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                />
              </div>

              {/* VIP Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterVIP === null ? "" : filterVIP.toString()}
                  onChange={(e) => setFilterVIP(e.target.value === "" ? null : e.target.value === "true")}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                >
                  <option value="">Tous les mangas</option>
                  <option value="true">VIP uniquement</option>
                  <option value="false">Non-VIP</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus === null ? "" : filterStatus.toString()}
                  onChange={(e) => setFilterStatus(e.target.value === "" ? null : e.target.value === "true")}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                >
                  <option value="">Tous les statuts</option>
                  <option value="true">Actifs uniquement</option>
                  <option value="false">Désactivés</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <SexyLoader />
          </div>
        ) : filteredMangas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun manga trouvé</h3>
            <p className="text-gray-600 dark:text-gray-400">Essayez d'ajuster vos filtres ou de créer un nouveau manga.</p>
          </motion.div>
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence>
                {filteredMangas.map((manga, index) => (
                  <motion.div
                    key={manga.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Cover Image */}
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {manga.cover_url ? (
                        <motion.img
                          src={manga.cover_url}
                          alt={manga.ref}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* VIP Badge */}
                      {manga.need_vip && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-medium">
                            <Star className="w-3 h-3" />
                            VIP
                          </span>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {manga.isDeleted ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Désactivé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Actif
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Link
                          to={`/mangas/${manga.id}`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all duration-200 text-white text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Voir
                        </Link>
                        <Link
                          to={`/mangas/${manga.id}/edit`}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all duration-200 text-white text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          Éditer
                        </Link>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {manga.ref}
                      </h3>
                      
                      {/* Checking Status */}
                      <div className="text-end mb-3">
                        <MangaChecking
                          manga={manga}
                          index={index}
                          reFetch={() => fetchMangas(page)}
                        />
                      </div>
                      
                      {/* Creator */}
                      <div className="flex items-center gap-2 mb-3">
                        {manga.creatorObj?.avatar && (
                          <img
                            src={manga.creatorObj.avatar}
                            alt={manga.creatorObj.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {manga.creatorObj?.name || manga.creator || '-'}
                        </span>
                      </div>
                      
                      {/* Category */}
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {manga.mangasCategory?.name || '-'} / {manga.mangasSubCategory?.name || '-'}
                        </span>
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <BookOpen className="w-4 h-4" />
                          <span>{manga.total_chapters || 0} chapitres</span>
                        </div>
                        
                        {/* Toggle Status */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleToggleDeleted(manga.id, manga.isDeleted || false)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            manga.isDeleted
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                              : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                          }`}
                          title={manga.isDeleted ? "Activer" : "Désactiver"}
                        >
                          {manga.isDeleted ? <CheckCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center items-center gap-4 mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </motion.button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-10 h-10 rounded-lg transition-all duration-200 ${
                          page === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                            : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Mangas;