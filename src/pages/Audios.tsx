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
import AudioChecking from "../components/AudioChecking";

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
        <div className="grid gap-6 md:gap-8 mb-4">
          {/* Top line */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
                Bibliothèque Audio
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-full p-1.5 transition
                    ${
                      viewMode === "grid"
                        ? "bg-white text-indigo-600 shadow dark:bg-gray-700 dark:text-indigo-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  title="Vue grille"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`rounded-full p-1.5 transition
                    ${
                      viewMode === "table"
                        ? "bg-white text-indigo-600 shadow dark:bg-gray-700 dark:text-indigo-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Link
                to="/audios/upload"
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <FilePlus className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        {audios.length === 0 ? (
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
                      Active
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
                        <td className="px-6 py-4">
                          {/* Moderation dropdown for audio checking */}
                          <React.Suspense
                            fallback={getCheckingBadge(audio.checking)}
                          >
                            {/** @ts-ignore-next-line */}
                            <AudioChecking
                              audio={audio}
                              index={index}
                              reFetch={reFetch}
                            />
                          </React.Suspense>
                        </td>
                        <td className="px-6 py-4">
                          {/* Active toggle switch */}
                          <motion.input
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="checkbox"
                            checked={!audio.isDeleted}
                            className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
                            onChange={
                              user?.role === RoleEnum.SUPERADMIN
                                ? () =>
                                    toggleDeleted(
                                      audio.id,
                                      audio.isDeleted || false
                                    )
                                : undefined
                            }
                          />
                        </td>
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
                      {/* Moderation dropdown for audio checking */}
                      <React.Suspense
                        fallback={getCheckingBadge(audio.checking)}
                      >
                        {/** @ts-ignore-next-line */}
                        <AudioChecking
                          audio={audio}
                          index={index}
                          reFetch={reFetch}
                        />
                      </React.Suspense>
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
