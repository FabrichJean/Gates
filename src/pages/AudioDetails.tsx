import React, { useState, useEffect } from "react";
import { useAudioUploadProgress } from "../hooks/useAudioUploadProgress";
import { motion } from "framer-motion";
import {
  Edit3,
  Send,
  ChevronLeft,
  ChevronRight,
  Music,
  Tag,
  Globe,
  Clock,
  Calendar,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { RiAlbumFill } from "react-icons/ri";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAudioByIdApi, uploadAudioToS3, updateAudio } from "../api/audios";
import { getAudioAlbumsByAudioIdApi } from "../api/audioAlbum";
import type { Audio } from "../types/audio";
import { AudioTitlesViewer } from "../components/AudioTitlesViewer";
import AudioPlayer from "../components/AudioPlayer";
import toast from "react-hot-toast";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import { formatDateFR } from "../utils/date";
import { cdnS3 } from "../utils/cdn";

const MiniLoader = () => (
  <div className="flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin" />
  </div>
);

const AudioDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useAuthMe();

  const [audio, setAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [audioAlbums, setAudioAlbums] = useState<any[]>([]);

  const uploadProgressMap = useAudioUploadProgress();
  const audioIdNum = audio?.id ? Number(audio.id) : null;
  const uploadProgress = audioIdNum && uploadProgressMap[audioIdNum] ? uploadProgressMap[audioIdNum] : null;

  const fetchAudio = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await getAudioByIdApi(id);
      setAudio(data);
    } catch (error) {
      console.error("Error fetching audio:", error);
      toast.error("Erreur lors du chargement de l'audio");
    } finally {
      setLoading(false);
    }
  };

  const fetchAudioAlbums = async (audioId: string | number) => {
    try {
      const res = await getAudioAlbumsByAudioIdApi(audioId);
      setAudioAlbums(res.data?.data || []);
    } catch (e) {
      setAudioAlbums([]);
    }
  };

  useEffect(() => {
    fetchAudio();
    if (id) fetchAudioAlbums(id);
  }, [id]);

  const handleSendToS3 = async () => {
    if (!audio) return;

    setUploading(true);
    try {
      await uploadAudioToS3(audio.id);
      toast.success("Upload vers S3 démarré!");
      await fetchAudio();
    } catch (error) {
      console.error("Error uploading to S3:", error);
      toast.error("Erreur lors de l'upload vers S3");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleDelete = async () => {
    if (!audio) return;

    const confirmed = window.confirm(
      audio.isDeleted
        ? "Voulez-vous restaurer cet audio ?"
        : "Voulez-vous supprimer cet audio ?",
    );

    if (!confirmed) return;

    try {
      await updateAudio(audio.id, { isDeleted: !audio.isDeleted });
      toast.success(audio.isDeleted ? "Audio restauré" : "Audio supprimé");
      await fetchAudio();
    } catch (error) {
      console.error("Error toggling delete:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCheckingBadge = (checking?: string) => {
    switch (checking) {
      case "checked":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700/50">
            <CheckCircle className="w-4 h-4" />
            checked
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700/50">
            <XCircle className="w-4 h-4" />
            rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-700/50">
            <Clock className="w-4 h-4" />
            En attente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <MiniLoader />
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <Music className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Audio introuvable
          </h2>
          <Link
            to="/audios"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/audios"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cover & Audio Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5 sticky top-6">
              {/* Cover */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 mb-5 shadow-md">
                {audio.cover_url || audio.s3_cover_url ? (
                  <img
                    src={cdnS3(audio.s3_cover_url) || cdnS3(audio.cover_url)}
                    alt={audio.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Music className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  </div>
                )}

                {audio.need_vip && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md">
                    VIP
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {(audio.audio_url || audio.s3_urls.audio) && (
                <div className="mb-5">
                  <AudioPlayer
                    audioUrl={audio.audio_url}
                    s3AudioUrl={audio.s3_urls.audio}
                    className="w-full rounded-xl"
                  />
                </div>
              )}

              {/* Status Badge */}
              <div className="mb-5 flex items-center justify-center">
                {getCheckingBadge(audio.checking)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/audios/${audio.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-all duration-200 shadow-md"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Modifier</span>
                </Link>

                {user?.role === RoleEnum.SUPERADMIN && (
                  <>
                    <button
                      onClick={handleSendToS3}
                      disabled={uploading || audio.processing !== "null" || audio.checking !== "checked"}
                      className="inline-flex items-center justify-center p-2.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-50 shadow-sm border border-gray-200 dark:border-gray-600"
                      title="Envoyer vers S3"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    {/* <button
                      onClick={handleToggleDelete}
                      className={`inline-flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 shadow-sm ${
                        audio.isDeleted
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      }`}
                      title={audio.isDeleted ? "Restaurer" : "Supprimer"}
                    >
                      {audio.isDeleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button> */}
                  </>
                )}
              </div>

              {/* Upload Progress */}
              {uploadProgress && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress || 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    Upload S3: {uploadProgress.progress || 0}%
                    {uploadProgress.status ? ` (${uploadProgress.status})` : ""}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Main Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {audio.title}
                  </h1>
                  {audio.ref && (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 font-mono">
                      Ref. {audio.ref}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateFR(audio.createdAt)}
                </div>
              </div>

              {audio.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  {audio.description}
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                    <Clock className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDuration(audio.duration)}
                  </div>
                </div>

                {audio.audioCategory && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 col-span-2 sm:col-span-1">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <Tag className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1 truncate">
                      {audio.audioCategory.name}
                      {audio.audioSubCategory && (
                        <>
                          <ChevronRight className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{audio.audioSubCategory.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {(audio.creator || audio.creatorObj) && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <img
                      className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                      src={cdnS3(audio.creatorObj?.avatar)}
                      alt={audio.creatorObj?.name || audio.creator}
                    />
                    <Link
                      to={audio.creator_id ? `/creators/${audio.creator_id}` : "#"}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors truncate"
                    >
                      {audio.creatorObj?.name || audio.creator || "..."}
                    </Link>
                  </div>
                )}

                {audio.plateform && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {audio.plateform.name}
                    </div>
                  </div>
                )}

                {audio.processing === "done" && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                      <Upload className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {audio.processing}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {audio.tagCategories && audio.tagCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span>Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {audio.tagCategories.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Multilingual Titles */}
            {audio.titles && audio.titles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span>Titres multilingues</span>
                </div>
                <AudioTitlesViewer
                  titles={audio.titles}
                  showDescription={true}
                  titleClassName="font-semibold text-gray-900 dark:text-white text-sm"
                  descriptionClassName="text-xs text-gray-600 dark:text-gray-400 mt-1"
                  compact={true}
                />
              </div>
            )}

            {/* Rejection Comment */}
            {audio.checking === "rejected" && audio.comment && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800/50 shadow-lg p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>Commentaire de rejet</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                  {audio.comment}
                </p>
              </div>
            )}

            {/* Audio Albums */}
            {(audioAlbums.length > 0 || audio.type_audio === "album") && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      <Music className="w-4 h-4" />
                    </div>
                    <span>Albums</span>
                  </div>
                  {audio.type_audio === "album" && audioAlbums.length === 0 && (
                    <Link
                      to={`/audio-albums/upload?audio_id=${audio?.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-md"
                    >
                      + Ajouter
                    </Link>
                  )}
                </div>
                
                {audioAlbums.length > 0 ? (
                  <div className="space-y-2">
                    {audioAlbums.map((album) => (
                      <Link
                        key={album.id}
                        to={`/audio-albums/${album.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                            <RiAlbumFill className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {album.ref || `Album #${album.id}`}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                              {album.album_number && (
                                <span>N° {album.album_number}</span>
                              )}
                              {album.total_tracks && (
                                <span>• {album.total_tracks} tracks</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                    Aucun album associé
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AudioDetails;