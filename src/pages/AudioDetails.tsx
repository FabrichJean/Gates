import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Edit3,
  Send,
  ChevronLeft,
  Music,
  Tag,
  Globe,
  Clock,
  User,
  Calendar,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAudioByIdApi, uploadAudioToS3, updateAudio } from "../api/audios";
import type { Audio } from "../types/audio";
import toast from "react-hot-toast";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import { formatDateFR } from "../utils/date";

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

const AudioDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useAuthMe();

  const [audio, setAudio] = useState<Audio | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    fetchAudio();
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
        : "Voulez-vous supprimer cet audio ?"
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
            En attente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <SexyLoader />
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Music className="w-20 h-20 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Audio introuvable
          </h2>
          <Link
            to="/audios"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Retour à la liste
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/audios"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour à la liste
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover & Audio Player */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl sticky top-8">
              {/* Cover */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 mb-6">
                {audio.cover_url || audio.s3_cover_url ? (
                  <img
                    src={audio.cover_url || audio.s3_cover_url}
                    alt={audio.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="w-24 h-24 text-white/30" />
                  </div>
                )}
                
                {audio.need_vip && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-yellow-500 text-white rounded-lg text-sm font-bold flex items-center gap-1 shadow-lg">
                    <span>VIP</span>
                  </div>
                )}
              </div>

              {/* Audio Player */}
              {(audio.audio_url || audio.s3_audio_url) && (
                <div className="mb-6">
                  <audio controls className="w-full">
                    <source src={audio.audio_url || audio.s3_audio_url} />
                  </audio>
                </div>
              )}

              {/* Status Badge */}
              <div className="mb-6 flex justify-center">
                {getCheckingBadge(audio.checking)}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to={`/audios/${audio.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium"
                >
                  <Edit3 className="w-5 h-5" />
                  Modifier
                </Link>

                {user?.role === RoleEnum.SUPERADMIN && (
                  <>
                    <button
                      onClick={handleSendToS3}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Envoyer vers S3
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleToggleDelete}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors font-medium ${
                        audio.isDeleted
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    >
                      {audio.isDeleted ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Restaurer
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5" />
                          Supprimer
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Title & Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {audio.title}
              </h1>

              {audio.ref && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Référence: {audio.ref}
                </p>
              )}

              {audio.description && (
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  {audio.description}
                </p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Duration */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Durée
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatDuration(audio.duration)}
                    </p>
                  </div>
                </div>

                {/* Category */}
                {audio.audioCategory && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Catégorie
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {audio.audioCategory.name}
                      </p>
                      {audio.audioSubCategory && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {audio.audioSubCategory.name}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Creator */}
                {(audio.creator || audio.creatorObj) && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Créateur
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {audio.creator || audio.creatorObj?.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Platform */}
                {audio.plateform && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Plateforme
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {audio.plateform.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Created At */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Créé le
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatDateFR(audio.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Upload Status */}
                {audio.upload_status && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Upload className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Statut d'upload
                      </p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {audio.upload_status}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {audio.tagCategories && audio.tagCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {audio.tagCategories.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Multilingual Titles */}
            {audio.titles && audio.titles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Titres multilingues
                </h2>
                <div className="space-y-4">
                  {audio.titles.map((title) => (
                    <div
                      key={title.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs font-medium uppercase">
                          {title.i18_language}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {title.title}
                      </h3>
                      {title.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {title.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comment (if rejected) */}
            {audio.checking === "rejected" && audio.comment && (
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  Commentaire de rejet
                </h2>
                <p className="text-red-700 dark:text-red-400">
                  {audio.comment}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AudioDetails;
