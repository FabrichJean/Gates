import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Eye,
  BookOpen,
  Image as ImageIcon,
  Tag,
  Star,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  FilePlus,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getMangasListApi } from "../api/mangasList";
import { updateManga, uploadMangaToS3 } from "../api/mangas";
import toast from "react-hot-toast";
import MangaChecking from "../components/MangaChecking";
import RoleEnum from "../utils/roleEnum";
import { useAuth } from "../hooks/useAuth";
import { RiStarFill } from "react-icons/ri";
import type { MangaTitles } from "../types/mangaTitles";
import { parseTitlesFromAPI } from "../utils/mangaTitlesUtils";
import { MangaTitle, MangaDescription } from "../components/MangaTitlesDisplay";

interface Manga {
  id: number;
  ref: string;
  title?: string;
  description?: string;
  titles?: string | MangaTitles; // Nouveau champ multilingue
  cover?: string;
  cover_url?: string;
  s3_cover_url?: string;
  creator?: string;
  creator_id?: number;
  creatorObj?: { name: string; avatar?: string };
  total_chapters?: number;
  need_vip?: boolean;
  isDeleted?: boolean;
  checking?: string;
  comment?: string;
  processing?: string;
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
          top: "50%",
          left: "50%",
          transform: `rotate(${i * 120}deg) translateX(120%)`,
          animation: `orbit 1.5s linear infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

const Mangas: React.FC = () => {
  const { user } = useAuth();
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVIP, setFilterVIP] = useState<boolean | null>(null);
  const [filterStatus, setFilterStatus] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

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

  const handleToggleDeleted = async (
    mangaId: number,
    currentStatus: boolean
  ) => {
    try {
      const formData = new FormData();
      formData.append("isDeleted", String(!currentStatus));

      await updateManga(mangaId, formData);
      toast.success(
        currentStatus
          ? "Manga activé avec succès"
          : "Manga désactivé avec succès"
      );
      fetchMangas(page);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleSendManga = async (mangaId: number) => {
    // Find the manga to check its status
    const manga = mangas.find(m => m.id === mangaId);

    try {
      toast.loading("Envoi du manga vers S3/R2...", { id: "send-manga" });
      
      await uploadMangaToS3(mangaId);
      
      toast.success("Manga envoyé avec succès!", { id: "send-manga" });
      fetchMangas(page);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'envoi du manga";
      toast.error(errorMessage, { id: "send-manga" });
    }
  };

  // Filtrage côté client
  const filteredMangas = mangas.filter((manga) => {
    const matchesSearch =
      manga.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manga.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manga.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manga.creatorObj?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manga.mangasCategory?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesVIP = filterVIP === null || manga.need_vip === filterVIP;
    const matchesStatus =
      filterStatus === null || manga.isDeleted === !filterStatus;

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
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-black shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title="Vue Grille"
                >
                  <LayoutGrid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === "table"
                      ? "bg-white text-black shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title="Vue Tableau"
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>

              <Link
                to={"/mangas/upload"}
                className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 text-gray-800 dark:text-gray-300 font-medium text-sm hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
              >
                <FilePlus className="w-5 h-auto text-blue-400 dark:text-blue-300" />
              </Link>
            </motion.div>
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
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Aucun manga trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez d'ajuster vos filtres ou de créer un nouveau manga.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Grid Layout */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                  {filteredMangas.map((manga, index) => (
                    <motion.div
                      key={manga.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Cover Image */}
                      <div className="aspect-[6/4] relative overflow-hidden">
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
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-medium">
                              <Star className="w-2.5 h-2.5" />
                              VIP
                            </span>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-2 left-2">
                          {manga.isDeleted ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-[10px] font-medium">
                              <XCircle className="w-2.5 h-2.5" />
                              Désactivé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-[10px] font-medium">
                              <CheckCircle className="w-2.5 h-2.5" />
                              Actif
                            </span>
                          )}
                        </div>

                        {/* Processing Status Badge */}
                        {manga.processing && (
                          <div className="absolute top-2 left-2" style={{ top: manga.isDeleted !== undefined ? '32px' : '8px' }}>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-nowrap ${
                              manga.processing === "done"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                            }`}>
                              {manga.processing === "done" ? "✓ Uploaded" : "Pending"}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Link
                            to={`/mangas/${manga.id}`}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all duration-200 text-white text-xs font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Voir
                          </Link>
                          <Link
                            to={`/mangas/${manga.id}/edit`}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/20 backdrop-blur-md rounded-lg hover:bg-white/30 transition-all duration-200 text-white text-xs font-medium"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Éditer
                          </Link>
                          {user?.role === RoleEnum.SUPERADMIN && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleSendManga(manga.id);
                              }}
                              disabled={manga.processing === "done"}
                              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 backdrop-blur-md rounded-lg transition-all duration-200 text-xs font-medium ${
                                manga.processing === "done"
                                  ? "bg-gray-500/20 text-gray-400 cursor-not-allowed opacity-60"
                                  : "bg-blue-500/20 hover:bg-blue-500/30 text-white"
                              }`}
                              title={
                                manga.processing === "done" 
                                  ? "Déjà envoyé" 
                                  : manga.checking !== "checked"
                                  ? "Manga must be checked first"
                                  : "Envoyer"
                              }
                            >
                              <Send className="w-3.5 h-3.5" />
                              {manga.processing === "done" ? "Uploaded" : "Send"}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        {/* Title & Checking */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            {manga.titles ? (
                              <>
                                <MangaTitle
                                  titles={parseTitlesFromAPI(manga.titles)}
                                  fallbackText={manga.title || manga.ref}
                                  as="h3"
                                  className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1"
                                />
                                <MangaDescription
                                  titles={parseTitlesFromAPI(manga.titles)}
                                  fallbackText={manga.description}
                                  as="p"
                                  className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1"
                                />
                              </>
                            ) : (
                              <>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                  {manga.title || manga.ref}
                                </h3>
                                {manga.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                                    {manga.description}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          <MangaChecking
                            manga={manga}
                            index={index}
                            reFetch={() => fetchMangas(page)}
                          />
                        </div>

                        {/* Creator */}
                        <div className="flex items-center gap-1.5 mb-2">
                          {manga.creatorObj?.avatar && (
                            <img
                              src={manga.creatorObj.avatar}
                              alt={manga.creatorObj.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {manga.creatorObj?.name || manga.creator || "-"}
                          </span>
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <Tag className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {manga.mangasCategory?.name || "-"} /{" "}
                            {manga.mangasSubCategory?.name || "-"}
                          </span>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{manga.total_chapters || 0}</span>
                          </div>

                          {/* Toggle Status */}
                           <motion.input
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="checkbox"
                            checked={!manga.isDeleted}
                            className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                            onChange={
                              user?.role === RoleEnum.SUPERADMIN
                                ? () => handleToggleDeleted(
                                manga.id,
                                manga.isDeleted || false
                              )
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Table Layout */
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cover
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ref
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Créateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Catégorie
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Chapitres
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Checking
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Activate
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      <AnimatePresence>
                        {filteredMangas.map((manga, index) => (
                          <motion.tr
                            key={manga.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                          >
                            {/* Cover */}
                            <td className="px-6 py-4">
                              <div className="w-12 h-16 rounded-md overflow-hidden shadow-sm">
                                {manga.cover_url ? (
                                  <img
                                    src={manga.s3_cover_url || manga.cover_url}
                                    alt={manga.ref}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* ref */}
                            <td className="px-6 py-4">
                              {manga.title ? (
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {manga.title}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {manga.ref}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {manga.ref}
                                </span>
                              )}
                            </td>

                            {/* Creator */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {manga.creatorObj?.avatar && (
                                  <img
                                    src={manga.creatorObj.avatar}
                                    alt={manga.creatorObj.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                )}
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {manga.creatorObj?.name ||
                                    manga.creator ||
                                    "-"}
                                </span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4">
                              <div className="flex flex-nowrap items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400 text-nowrap">
                                  {manga.mangasCategory?.name || "-"} /{" "}
                                  {manga.mangasSubCategory?.name || "-"}
                                </span>
                              </div>
                            </td>

                            {/* Chapters */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{manga.total_chapters || 0}</span>
                              </div>
                            </td>

                            {/* Checking */}
                            <td className="px-6 py-4 text-center">
                              <MangaChecking
                                manga={manga}
                                index={index}
                                reFetch={() => fetchMangas(page)}
                              />
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 text-center">
                              {manga.processing ? (
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-nowrap ${
                                  manga.processing === "done"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                }`}>
                                  {manga.processing === "done" ? "✓ Uploaded" : "Pending"}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 dark:text-gray-500">-</span>
                              )}
                            </td>

                            {/* Activate */}
                            <td className="px-6 py-4 text-center">
                            <motion.input
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="checkbox"
                              checked={!manga.isDeleted}
                              className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                              onChange={
                                user?.role === RoleEnum.SUPERADMIN
                                  ? () => handleToggleDeleted(
                                  manga.id,
                                  manga.isDeleted || false
                                )
                                  : undefined
                              }
                            />
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  to={`/mangas/${manga.id}`}
                                  className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-all duration-200"
                                  title="Voir"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  to={`/mangas/${manga.id}/edit`}
                                  className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-all duration-200"
                                  title="Éditer"
                                >
                                  <Edit className="w-4 h-4" />
                                </Link>
                                {user?.role === RoleEnum.SUPERADMIN && (
                                  <button
                                    onClick={() => handleSendManga(manga.id)}
                                    disabled={manga.processing === "done"}
                                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                                      manga.processing === "done"
                                        ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed opacity-60"
                                        : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                                    }`}
                                    title={
                                      manga.processing === "done" 
                                        ? "Déjà envoyé" 
                                        : manga.checking !== "checked"
                                        ? "Manga must be checked first"
                                        : "Envoyer"
                                    }
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                    <span className="px-2 text-gray-500 dark:text-gray-400">
                      ...
                    </span>
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
