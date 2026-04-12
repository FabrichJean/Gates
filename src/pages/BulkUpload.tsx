import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Image,
  X,
  ArrowRight,
  Upload,
  Video,
  ImageIcon,
  Link2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";
import { useAuthMe } from "../hooks/useAuth";
import { useVideosContext } from "../context/VideosContext";
import { Md5 } from "ts-md5";

export type MediaFile = {
  id: string;
  file: File;
  preview: string;
  type: "video" | "image";
  name: string;
  pairedWith?: string;
};

export type BulkVideoItem = {
  id: string;
  videoId?: string;
  coverId?: string;
};

type BulkUploadState = {
  mediaFiles: MediaFile[];
  videoPairs: BulkVideoItem[];
};

const initialState: BulkUploadState = {
  mediaFiles: [],
  videoPairs: [],
};

const BulkUpload = () => {
  const ctx = useVideosContext();
  if (!ctx) return null;

  const { reFetch } = ctx;
  const { data: user } = useAuthMe();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [state, setState] = useState<BulkUploadState>(initialState);
  const { mediaFiles, videoPairs } = state;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ref, setRef] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (user?.id && user?.username) {
      const hash = Md5.hashStr(
        user.id.toString() + Date.now().toString()
      ).slice(0, 8);
      setRef(user.username.slice(0, 3) + hash);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      mediaFiles.forEach((m) => {
        if (m.preview) URL.revokeObjectURL(m.preview);
      });
    };
  }, [mediaFiles]);

  const generateMediaId = () => `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const isVideoFile = (file: File): boolean => file.type.startsWith("video/");
  const isImageFile = (file: File): boolean => file.type.startsWith("image/");

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles: MediaFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!isVideoFile(file) && !isImageFile(file)) {
          toast.error(
            t("videos.upload.errors.invalid_file").replace("{name}", file.name)
          );
          continue;
        }

        const preview = URL.createObjectURL(file);
        const type = isVideoFile(file) ? "video" : "image";

        newFiles.push({
          id: generateMediaId(),
          file,
          preview,
          type,
          name: file.name,
        });
      }

      if (newFiles.length > 0) {
        setState((prev) => ({
          ...prev,
          mediaFiles: [...prev.mediaFiles, ...newFiles],
        }));
        toast.success(
          t("videos.upload.bulk.files_added").replace("{count}", String(newFiles.length))
        );
      }
    },
    [t]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  const removeMedia = (mediaId: string) => {
    setState((prev) => {
      const mediaToRemove = prev.mediaFiles.find((m) => m.id === mediaId);
      if (mediaToRemove && mediaToRemove.preview) {
        URL.revokeObjectURL(mediaToRemove.preview);
      }

      const updatedPairs = prev.videoPairs.filter(
        (p) => p.videoId !== mediaId && p.coverId !== mediaId
      );

      return {
        ...prev,
        mediaFiles: prev.mediaFiles.filter((m) => m.id !== mediaId),
        videoPairs: updatedPairs,
      };
    });
  };

  const pairMedias = (videoId: string, imageId: string) => {
    const existingPair = videoPairs.find(
      (p) => p.videoId === videoId || p.coverId === imageId
    );

    if (existingPair) {
      toast.error(t("videos.upload.bulk.already_paired"));
      return;
    }

    setState((prev) => ({
      ...prev,
      videoPairs: [
        ...prev.videoPairs,
        {
          id: generateMediaId(),
          videoId,
          coverId: imageId,
        },
      ],
    }));

    toast.success(t("videos.upload.bulk.paired_success"));
  };

  const unpairMedia = (pairId: string) => {
    setState((prev) => ({
      ...prev,
      videoPairs: prev.videoPairs.filter((p) => p.id !== pairId),
    }));
  };

  const videos = mediaFiles.filter((m) => m.type === "video");
  const images = mediaFiles.filter((m) => m.type === "image");
  const unpairedVideos = videos.filter(
    (v) => !videoPairs.some((p) => p.videoId === v.id)
  );
  const pairedVideos = videoPairs.filter((p) => p.videoId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("videos.upload.bulk.title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("videos.upload.bulk.subtitle")}
          </p>
        </motion.div>

        {/* Reference Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Référence
          </label>
          <input
            type="text"
            value={ref || ""}
            onChange={(e) => setRef(e.currentTarget.value.trim())}
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("videos.upload.reference.placeholder")}
          />
        </div>

        {/* Upload Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {t("videos.upload.bulk.step1_title")}
          </h2>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("videos.upload.bulk.drop_hint")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("videos.upload.bulk.drop_hint_details")}
            </p>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="video/*,image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Media Lists */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Videos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-600" />
                Vidéos ({videos.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                  >
                    <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      <video src={video.preview} className="w-full h-full object-cover" muted />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {video.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(video.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => removeMedia(video.id)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                Covers ({images.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group"
                  >
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-16 h-12 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(image.file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => removeMedia(image.id)}
                      className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pairing Interface */}
        {videos.length > 0 && images.length > 0 && (
          <PairingInterface
            videos={videos}
            images={images}
            mediaFiles={mediaFiles}
            unpairedVideos={unpairedVideos}
            pairedVideos={pairedVideos}
            videoPairs={videoPairs}
            onPair={pairMedias}
            onUnpair={unpairMedia}
          />
        )}

        {/* Actions */}
        {mediaFiles.length > 0 && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => navigate("/videos")}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {t("common.cancel")}
            </button>
            <button
              disabled={pairedVideos.length === 0}
              className={`px-5 py-2.5 rounded-lg font-medium transition ${
                pairedVideos.length === 0
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Continuer ({pairedVideos.length})
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BulkUpload;

// Pairing Interface Component - Simple Click-based System
type PairingInterfaceProps = {
  videos: MediaFile[];
  images: MediaFile[];
  mediaFiles: MediaFile[];
  unpairedVideos: MediaFile[];
  pairedVideos: BulkVideoItem[];
  videoPairs: BulkVideoItem[];
  onPair: (videoId: string, imageId: string) => void;
  onUnpair: (pairId: string) => void;
};

const PairingInterface: React.FC<PairingInterfaceProps> = ({
  videos,
  images,
  mediaFiles,
  unpairedVideos,
  pairedVideos,
  videoPairs,
  onPair,
  onUnpair,
}) => {
  const [openCoverSelector, setOpenCoverSelector] = useState<string | null>(null);

  const isCoverPaired = (imageId: string) => videoPairs.some((p) => p.coverId === imageId);
  const getCoverForVideo = (videoId: string) => videoPairs.find((p) => p.videoId === videoId)?.coverId;
  
  // Memoize to ensure consistency
  const getAvailableCoverImages = (excludeVideoId?: string) => {
    return images.filter((i) => {
      const paired = isCoverPaired(i.id);
      return !paired;
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-green-600" />
        Association Vidéos/Covers
      </h2>

      {/* Videos List with Cover Selector */}
      <div className="space-y-2">
        <AnimatePresence>
          {videos.map((video) => {
            const pairedCoverId = getCoverForVideo(video.id);
            const pairedCover = pairedCoverId ? mediaFiles.find((m) => m.id === pairedCoverId) : null;
            const isOpen = openCoverSelector === video.id;

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {/* Video Row */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {/* Video Preview - Larger */}
                  <div className="relative flex-shrink-0">
                    <div className="w-24 h-16 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden border border-blue-200 dark:border-blue-900">
                      <video src={video.preview} className="w-full h-full object-cover" muted />
                    </div>
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      ▶
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {video.name.slice(0, 35)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(video.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Pairing Indicator */}
                  <div className="flex-shrink-0">
                    <ArrowRight className={`w-4 h-4 ${pairedCover ? 'text-green-600' : 'text-gray-300 dark:text-gray-600'}`} />
                  </div>

                  {/* Cover Selector Button */}
                  <button
                    onClick={() => setOpenCoverSelector(isOpen ? null : video.id)}
                    className={`flex-shrink-0 w-24 h-16 rounded border-2 transition overflow-hidden bg-gray-200 dark:bg-gray-700 ${
                      pairedCover
                        ? "border-green-300 dark:border-green-700"
                        : "border-dashed border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {pairedCover ? (
                      <img
                        src={pairedCover.preview}
                        alt="cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 flex-col gap-1">
                        <Image className="w-5 h-5" />
                        <span className="text-xs">+</span>
                      </div>
                    )}
                  </button>

                  {/* Remove Button */}
                  {pairedCover && (
                    <button
                      onClick={() => onUnpair(videoPairs.find((p) => p.videoId === video.id)?.id || "")}
                      className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Cover Selection Modal */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-3"
                    >
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Sélectionner une cover ({getAvailableCoverImages().length} disponible{getAvailableCoverImages().length !== 1 ? "s" : ""})
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {getAvailableCoverImages().map((cover) => (
                          <motion.button
                            key={cover.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              onPair(video.id, cover.id);
                              setOpenCoverSelector(null);
                            }}
                            className="relative aspect-square rounded border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 overflow-hidden transition group bg-gray-200 dark:bg-gray-700"
                          >
                            <img
                              src={cover.preview}
                              alt={cover.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-white text-xs font-medium">Ajouter</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};