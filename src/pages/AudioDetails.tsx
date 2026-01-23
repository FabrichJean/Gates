import React, { useState, useEffect } from "react";
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
  User,
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
import toast from "react-hot-toast";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import { formatDateFR } from "../utils/date";

const MiniLoader = () => (
  <div className="flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin" />
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
      case "approved":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Approuvé
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-4 h-4 mr-1.5" />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-4 h-4 mr-1.5" />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <MiniLoader />
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-4"
        >
          <Music className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Audio introuvable
          </h2>
          <Link
            to="/audios"
            className="text-sm text-gray-600 dark:text-gray-300 underline"
          >
            Retour à la liste
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-3 py-6"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link
            to="/audios"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Cover & Audio Player */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-md p-3 shadow sticky top-6">
              {/* Cover */}
              <div className="relative w-full h-40 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-900 mb-3">
                {audio.cover_url || audio.s3_cover_url ? (
                  <img
                    src={audio.cover_url || audio.s3_cover_url}
                    alt={audio.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Music className="w-10 h-10 text-gray-400" />
                  </div>
                )}

                {audio.need_vip && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-400 text-white rounded text-xs font-semibold">
                    VIP
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {(audio.audio_url || audio.s3_audio_url) && (
                <div className="mb-3">
                  <audio controls className="w-full">
                    <source src={audio.audio_url || audio.s3_audio_url} />
                  </audio>
                </div>
              )}

              {/* Compact status */}
              <div className="mb-3 flex items-center justify-center">
                {getCheckingBadge(audio.checking)}
              </div>

              {/* Actions: compact buttons */}
              <div className="flex gap-2">
                <Link
                  to={`/audios/${audio.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 dark:bg-gray-900 text-sm rounded text-gray-700 dark:text-gray-200 hover:bg-gray-200 hover:dark:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Modifier</span>
                </Link>

                {user?.role === RoleEnum.SUPERADMIN && (
                  <>
                    <button
                      onClick={handleSendToS3}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-2 py-2 bg-gray-100 dark:bg-gray-900 text-sm rounded text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleToggleDelete}
                      className={`inline-flex items-center gap-2 px-2 py-2 text-sm rounded ${
                        audio.isDeleted
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {audio.isDeleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="lg:col-span-2 space-y-3"
          >
            <div className="bg-white dark:bg-gray-800 rounded-md p-4 shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {audio.title}
                  </h1>
                  {audio.ref && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Ref. {audio.ref}
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  {formatDateFR(audio.createdAt)}
                </div>
              </div>

              {audio.description && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {audio.description}
                </p>
              )}

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    {formatDuration(audio.duration)}
                  </div>
                </div>

                {audio.audioCategory && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded">
                    <Tag className="w-4 h-4 text-gray-600" />
                    <div className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      {audio.audioCategory.name}
                      {audio.audioSubCategory && (
                        <>
                          <ChevronRight className="w-3 h-3" />
                          {audio.audioSubCategory.name}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {(audio.creator || audio.creatorObj) && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded">
                    <img
                      className="w-6 h-6 rounded-full object-cover"
                      src={audio.creatorObj?.avatar}
                    />
                    <div className="text-xs text-gray-700 dark:text-gray-300 ">
                      <Link
                        to={
                          audio.creator_id
                            ? `/creators/${audio.creator_id}`
                            : "#"
                        }
                        className="hover:text-blue-500 hover:dark:text-blue-400"
                      >
                        {audio.creatorObj?.name || audio.creator || "..."}
                      </Link>
                    </div>
                  </div>
                )}

                {audio.plateform && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded">
                    <Globe className="w-4 h-4 text-gray-600" />
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      {audio.plateform.name}
                    </div>
                  </div>
                )}

                {audio.upload_status && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/40 rounded">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <div className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                      {audio.upload_status}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {audio.tagCategories && audio.tagCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-md p-3 shadow">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {audio.tagCategories.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-900/30 rounded"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Multilingual Titles */}
            {audio.titles && audio.titles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-md p-3 shadow">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">Titres multilingues</span>
                </div>
                <AudioTitlesViewer
                  titles={audio.titles}
                  showDescription={true}
                  titleClassName="font-medium text-gray-900 dark:text-gray-100 text-sm"
                  descriptionClassName="text-xs text-gray-600 dark:text-gray-400 mt-1"
                  compact={true}
                />
              </div>
            )}

            {/* Comment (if rejected) */}
            {audio.checking === "rejected" && audio.comment && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-md p-3">
                <div className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                  Commentaire de rejet
                </div>
                <div className="text-sm text-red-700 dark:text-red-400">
                  {audio.comment}
                </div>
              </div>
            )}

            {/* Audio Albums liés */}
            {audioAlbums.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-md p-3 shadow">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <Music className="w-4 h-4" />
                  <span className="font-medium">Albums de cet audio</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  {audioAlbums.map((album) => (
                    <Link
                      key={album.id}
                      to={`/audio-albums/${album.id}`}
                      className="flex px-3 py-2 rounded justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border border-slate-300 dark:border-slate-700"
                    >
                      <span className="flex items-center gap-1">
                        {/* image cover audio */}
                        <RiAlbumFill className=" " />
                        <span className="font-semibold">
                          {album.ref || `Album #${album.id}`}
                        </span>
                        {album.album_number && (
                          <span className="ml-2 text-xs text-gray-500">
                            (N° {album.album_number})
                          </span>
                        )}
                        {album.total_tracks && (
                          <span className="ml-2 text-xs text-gray-500">
                            {album.total_tracks} tracks
                          </span>
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Si aucun album, proposer aussi le bouton */}
            {audio.type_audio === "album" && audioAlbums.length === 0 ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-md p-3 shadow">
                  <div className=" flex items-center gap-2 pb-2">
                    <Music className="w-4 h-4" />
                    <span className="font-medium"></span>
                    <Link
                      to={`/audio-albums/upload?audio_id=${audio?.id}`}
                      className="ml-auto px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-semibold"
                    >
                      + Add album
                    </Link>
                  </div>
                  <div className="flex flex-col gap-2">
                    {audioAlbums.map((album) => (
                      <Link
                        key={album.id}
                        to={`/audio-albums/${album.id}`}
                        className="flex px-3 py-2 rounded justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border border-slate-300 dark:border-slate-700"
                      >
                        <span className="flex items-center gap-1">
                          {/* image cover audio */}
                          <RiAlbumFill className=" " />
                          <span className="font-semibold">
                            {album.ref || `Album #${album.id}`}
                          </span>
                          {album.album_number && (
                            <span className="ml-2 text-xs text-gray-500">
                              (N° {album.album_number})
                            </span>
                          )}
                          {album.total_tracks && (
                            <span className="ml-2 text-xs text-gray-500">
                              {album.total_tracks} tracks
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AudioDetails;
