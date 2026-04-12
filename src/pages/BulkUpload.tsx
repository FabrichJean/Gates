import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film,
  Image,
  FileVideo,
  FileImage,
  X,
  Trash2,
  Plus,
  ChevronDown,
  Globe,
  User,
  Tag,
  Loader2,
  Link2,
  Unlink,
  ArrowRight,
} from "lucide-react";
import { BiUpload } from "react-icons/bi";
import toast from "react-hot-toast";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";
import { useAuthMe } from "../hooks/useAuth";
import { useVideosContext } from "../context/VideosContext";
import { Md5 } from "ts-md5";
import type { Category } from "../components/CategoryAutoComplete";
import type { SubCategory } from "../hooks/useSubCategory";
import type { Platform } from "../hooks/usePlatform";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("videos.upload.bulk.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("videos.upload.bulk.subtitle")}
          </p>
        </motion.div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            {t("videos.upload.reference.title")}
          </h2>
          <input
            type="text"
            value={ref || ""}
            onChange={(e) => setRef(e.currentTarget.value.trim())}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
            placeholder={t("videos.upload.reference.placeholder")}
          />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            {t("videos.upload.bulk.step1_title")}
          </h2>

          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              borderColor: isDragging ? "rgb(59, 130, 246)" : "rgb(209, 213, 219)",
              backgroundColor: isDragging ? "rgb(229, 237, 255)" : "rgb(249, 250, 251)",
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/10"
                : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            }`}
          >
            <div className="text-center">
              <div className="mb-4 text-gray-400 dark:text-gray-500">
                <BiUpload className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {t("videos.upload.bulk.drop_hint")}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                {t("videos.upload.bulk.drop_hint_details")}
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="video/*,image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </motion.div>

          {mediaFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid grid-cols-3 gap-4"
            >
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {t("videos.upload.bulk.total_files")}
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {mediaFiles.length}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {t("videos.upload.bulk.videos_count")}
                </p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {videos.length}
                </p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
                <p className="text-sm text-pink-600 dark:text-pink-400 font-medium">
                  {t("videos.upload.bulk.covers_count")}
                </p>
                <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                  {images.length}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-purple-600" />
                {t("videos.upload.bulk.videos")} ({videos.length})
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {videos.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {video.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(video.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeMedia(video.id)}
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
            >
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5 text-pink-600" />
                {t("videos.upload.bulk.covers")} ({images.length})
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {images.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-600 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {image.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(image.file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeMedia(image.id)}
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}

        {videos.length > 0 && images.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />
              {t("videos.upload.bulk.step2_title")}
            </h2>

            {unpairedVideos.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("videos.upload.bulk.select_video")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {unpairedVideos.map((video) => (
                      <motion.div
                        key={video.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                      >
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              pairMedias(video.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all"
                        >
                          <option value="">
                            {video.name} → {t("videos.upload.bulk.select_cover")}
                          </option>
                          {images.map((image) => (
                            <option key={image.id} value={image.id}>
                              {image.name}
                            </option>
                          ))}
                        </select>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {pairedVideos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t("videos.upload.bulk.paired_items")}
                </p>
                <div className="space-y-3">
                  <AnimatePresence>
                    {pairedVideos.map((pair) => {
                      const video = mediaFiles.find((m) => m.id === pair.videoId);
                      const cover = mediaFiles.find((m) => m.id === pair.coverId);

                      return (
                        <motion.div
                          key={pair.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
                        >
                          <video
                            src={video?.preview}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                            muted
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                              {video?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {cover?.name}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <img
                            src={cover?.preview}
                            alt="cover"
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => unpairMedia(pair.id)}
                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all flex-shrink-0"
                          >
                            <Unlink className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

        {mediaFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/videos")}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              {t("common.cancel")}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={pairedVideos.length === 0}
              className={`px-6 py-3 rounded-lg font-medium shadow-lg transition-all ${
                pairedVideos.length === 0
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl"
              }`}
            >
              {t("videos.upload.bulk.continue")} ({pairedVideos.length})
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BulkUpload;
