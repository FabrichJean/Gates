import React, { useState } from "react";
import { useAudioUploadProgress } from "../hooks/useAudioUploadProgress";
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
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import RoleEnum from "../utils/roleEnum";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import { PAGE_SIZE } from "../constant";
import { useAudiosContext } from "../context/AudiosContext";
import AudioChecking from "../components/AudioChecking";
import { cdnS3 } from "../utils/cdn";

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

  const uploadProgressMap = useAudioUploadProgress();

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            Approuvé
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 backdrop-blur-sm border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 backdrop-blur-sm border border-amber-500/20">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Subtle background element */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-slate-200/30 dark:bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-900 dark:bg-slate-800 shadow-lg">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Bibliothèque Audio
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    {total} audio{total > 1 ? "s" : ""} au total
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/audios/upload"
                  className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300"
                >
                  <FilePlus className="h-4 w-4" />
                  <span>Nouveau</span>
                </Link>

                <div className="flex items-center gap-2 backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 rounded-xl p-1.5 border border-slate-200/60 dark:border-slate-700/60 shadow-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg p-2 transition-all duration-200
                      ${
                        viewMode === "grid"
                          ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                    title="Vue grille"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`rounded-lg p-2 transition-all duration-200
                      ${
                        viewMode === "table"
                          ? "bg-slate-900 dark:bg-slate-700 text-white shadow-md"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      }`}
                    title="Vue liste"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {audios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg p-20 text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <Volume2 className="w-10 h-10 text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Aucun audio trouvé
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Commencez par ajouter votre premier audio pour construire votre bibliothèque
            </p>
            <Link
              to="/audios/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-300 font-medium shadow-lg"
            >
              <FilePlus className="w-5 h-5" />
              Ajouter un audio
            </Link>
          </motion.div>
        ) : viewMode === "table" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Audio
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Durée
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Créateur
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-20">
                      Actif
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  <AnimatePresence mode="popLayout">
                    {audios.map((audio, index) => (
                      <motion.tr
                        key={audio.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="group hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300"
                      >
                        {/* Audio */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                              <div
                                className={
                                  "absolute inset-0 flex items-center justify-center " +
                                  (audio.cover_url || audio.s3_cover_url
                                    ? "bg-transparent"
                                    : "bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950")
                                }
                              >
                                {audio.cover_url || audio.s3_cover_url ? (
                                  <img
                                    src={
                                      cdnS3(audio.s3_cover_url) ||
                                      cdnS3(audio.cover_url)
                                    }
                                    alt={audio.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Music className="w-7 h-7 text-white" />
                                )}
                              </div>

                              {/* Progress overlay */}
                              {uploadProgressMap[audio.id] && (
                                <div className="absolute inset-0 backdrop-blur-sm bg-black/70 flex flex-col items-center justify-center p-2">
                                  <div className="w-full bg-white/20 rounded-full h-1.5 mb-1.5">
                                    <div
                                      className="bg-slate-200 dark:bg-slate-100 h-1.5 rounded-full transition-all"
                                      style={{
                                        width: `${uploadProgressMap[audio.id].progress}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-white font-semibold">
                                    {uploadProgressMap[audio.id].progress}%
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[220px] mb-1">
                                {audio.title}
                              </div>
                              {audio.ref && (
                                <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-200/50 dark:bg-slate-700/50 text-xs text-slate-600 dark:text-slate-400 font-mono">
                                  #{audio.ref}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Catégorie */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {audio.audioCategory?.name || "—"}
                            </span>
                            {audio.audioSubCategory?.name && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/70 text-xs text-slate-700 dark:text-slate-300 w-fit">
                                {audio.audioSubCategory.name}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Durée */}
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-200/50 dark:bg-slate-700/50 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(audio.duration)}
                          </div>
                        </td>

                        {/* Créateur */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                              <img src={cdnS3(audio.creatorObj.avatar)} className="w-full h-full rounded-full text-slate-600 dark:text-slate-400" />
                            </div>
                            <Link to={`/creators/${audio.creatorObj.id}`} className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                              {audio.creator || audio.creatorObj?.name || "—"}
                            </Link>
                          </div>
                        </td>

                        {/* Statut */}
                        <td className="px-6 py-4">
                          <React.Suspense
                            fallback={getCheckingBadge(audio.checking)}
                          >
                            <AudioChecking
                              audio={audio}
                              index={index}
                              reFetch={reFetch}
                            />
                          </React.Suspense>
                        </td>

                        {/* Actif */}
                        <td className="px-6 py-4 text-center">
                          <label className="relative inline-flex items-center cursor-pointer group/toggle">
                            <input
                              type="checkbox"
                              checked={!audio.isDeleted}
                              onChange={
                                user?.role === RoleEnum.SUPERADMIN
                                  ? () =>
                                      toggleDeleted(
                                        audio.id,
                                        audio.isDeleted || false,
                                      )
                                  : undefined
                              }
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-full peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-500/20 transition-all after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-lg peer-checked:after:translate-x-6 peer-checked:bg-slate-900 dark:peer-checked:bg-slate-600 scale-50" />
                          </label>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/audios/${audio.id}`}
                              className="p-2 rounded-xl backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 transition-all duration-200 shadow-lg"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/audios/${audio.id}/edit`}
                              className="p-2 rounded-xl backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 transition-all duration-200 shadow-lg"
                              title="Éditer"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>

                            {user?.role === RoleEnum.SUPERADMIN &&
                              (audio.processing === "null" && audio.checking === "checked") && (
                                <button
                                  onClick={() => sendAudio(audio.id)}
                                  className="p-2 rounded-xl backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 transition-all duration-200 shadow-lg"
                                  title="Envoyer vers S3"
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
          </motion.div>
        ) : (
          /* Grid View */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {audios.map((audio, index) => (
                <motion.div
                  key={audio.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  className="group backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-56 bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center overflow-hidden">
                    {audio.cover_url || audio.s3_cover_url ? (
                      <img
                        src={
                          cdnS3(audio.s3_cover_url) || cdnS3(audio.cover_url)
                        }
                        alt={audio.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <Music className="w-24 h-24 text-white/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    <div className="absolute top-4 right-4">
                      <React.Suspense
                        fallback={getCheckingBadge(audio.checking)}
                      >
                        <AudioChecking
                          audio={audio}
                          index={index}
                          reFetch={reFetch}
                        />
                      </React.Suspense>
                    </div>

                    {audio.ref && (
                      <div className="absolute top-4 left-4 backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-xl text-xs text-white font-mono border border-white/20">
                        #{audio.ref}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 truncate">
                      {audio.title}
                    </h3>

                    <div className="space-y-2.5 mb-5">
                      <div className="flex items-center gap-2.5 text-sm">
                        <div className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/70">
                          <Tag className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {audio.audioCategory?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <div className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/70">
                          <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {formatDuration(audio.duration)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <div className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700/70">
                          <Star className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                          {audio.creator || audio.creatorObj?.name || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/audios/${audio.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        Voir
                      </Link>
                      <Link
                        to={`/audios/${audio.id}/edit`}
                        className="flex items-center justify-center p-2.5 backdrop-blur-sm bg-white/60 dark:bg-slate-800/60 rounded-xl hover:bg-slate-900 hover:text-white dark:hover:bg-slate-700 transition-all duration-200 shadow-lg border border-slate-200/60 dark:border-slate-700/60"
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
            transition={{ delay: 0.2 }}
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