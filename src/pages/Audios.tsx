import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  Eye,
  Music,
  Clock,
  Tag,
  Star,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
  FilePlus,
  Send,
  Volume2,
} from "lucide-react";
import { Link } from "react-router-dom";
import RoleEnum from "../utils/roleEnum";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import { PAGE_SIZE } from "../constant";
import { useAudiosContext } from "../context/AudiosContext";

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

const Audios: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const ctx = useAudiosContext();
  if (!ctx) return null;

  const {
    page,
    setPage,
    audios,
    total,
    loading,
    reFetch,
    toggleDeleted,
    sendAudio,
  } = ctx;

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCheckingBadge = (checking?: string) => {
    switch (checking) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approuvé
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
    }
  };

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
                Bibliothèque Audio
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez votre collection de fichiers audio
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-indigo-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "table"
                      ? "bg-indigo-500 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Audio Button */}
              <Link
                to="/audios/upload"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FilePlus className="w-5 h-5" />
                <span className="font-medium">Nouveau Audio</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Audios
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {total}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Volume2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Approuvés
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {audios.filter((a) => a.checking === "approved").length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  En attente
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {audios.filter((a) => a.checking === "pending").length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <SexyLoader />
          </div>
        ) : audios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Volume2 className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Aucun audio trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Commencez par ajouter votre premier audio
            </p>
            <Link
              to="/audios/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              <FilePlus className="w-5 h-5" />
              Ajouter un audio
            </Link>
          </motion.div>
        ) : viewMode === "table" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Audio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Créateur
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <AnimatePresence mode="popLayout">
                    {audios.map((audio, index) => (
                      <motion.tr
                        key={audio.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              {audio.cover_url || audio.s3_cover_url ? (
                                <img
                                  src={audio.cover_url || audio.s3_cover_url}
                                  alt={audio.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music className="w-8 h-8 text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {audio.title}
                              </div>
                              {audio.ref && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Ref: {audio.ref}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {audio.audioCategory?.name || "N/A"}
                          </div>
                          {audio.audioSubCategory && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {audio.audioSubCategory.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {formatDuration(audio.duration)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {audio.creator || audio.creatorObj?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4">{getCheckingBadge(audio.checking)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/audios/${audio.id}`}
                              className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/audios/${audio.id}/edit`}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Éditer"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            {user?.role === RoleEnum.SUPERADMIN && (
                              <>
                                <button
                                  onClick={() => sendAudio(audio.id)}
                                  className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                  title="Envoyer vers S3"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    toggleDeleted(audio.id, audio.isDeleted)
                                  }
                                  className={`p-2 rounded-lg transition-colors ${
                                    audio.isDeleted
                                      ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
                                      : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                  }`}
                                  title={
                                    audio.isDeleted ? "Restaurer" : "Supprimer"
                                  }
                                >
                                  {audio.isDeleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {audios.map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    {audio.cover_url || audio.s3_cover_url ? (
                      <img
                        src={audio.cover_url || audio.s3_cover_url}
                        alt={audio.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-20 h-20 text-white/30" />
                    )}
                    <div className="absolute top-3 right-3">
                      {getCheckingBadge(audio.checking)}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                      {audio.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Tag className="w-4 h-4" />
                        <span>{audio.audioCategory?.name || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(audio.duration)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Star className="w-4 h-4" />
                        <span>
                          {audio.creator || audio.creatorObj?.name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/audios/${audio.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </Link>
                      <Link
                        to={`/audios/${audio.id}/edit`}
                        className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Pagination
              totalItems={total}
              pageSize={PAGE_SIZE}
              currentPage={page}
              onPageChange={setPage}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Audios;
