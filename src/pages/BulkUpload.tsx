import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
  Globe,
  User,
  Tag,
  Plus,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";
import { useAuthMe } from "../hooks/useAuth";
import { useVideosContext } from "../context/VideosContext";
import { Md5 } from "ts-md5";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import useVideoTagCategories from "../hooks/useVideoTagCategories";
import { uploadVideoBulk } from "../api/videos";

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
  ref?: string;
  categoryId?: number;
  subCategoryId?: number;
  platformId?: number;
  creatorId?: number;
  creatorName?: string;
  videoType?: "short" | "long";
  tags?: { id: string; name: string }[];
  titles?: { en?: string; fr?: string; zh?: string };
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
  const [isDragging, setIsDragging] = useState(false);

  const [category, setCategory] = useState<any | null>(null);
  const [subCategory, setSubCategory] = useState<any | null>(null);
  const [platform, setPlatform] = useState<any | null>(null);
  const [creator, setCreator] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [videoType, setVideoType] = useState<"short" | "long">("short");
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string }[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [videoTitles, setVideoTitles] = useState<Record<string, { en?: string; fr?: string; zh?: string }>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  const { items: tagSuggestions } = useVideoTagCategories();

  // Filter tag suggestions based on query
  const filteredTagSuggestions = useMemo(() => {
    if (!tagQuery.trim()) {
      return tagSuggestions || [];
    }
    const query = tagQuery.toLowerCase();
    return (tagSuggestions || []).filter((tag: any) =>
      tag.name.toLowerCase().includes(query)
    );
  }, [tagQuery, tagSuggestions]);

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

    const generateVideoRef = () => {
      const hash = Md5.hashStr(
        videoId + Date.now().toString()
      ).slice(0, 8);
      return (user?.username?.slice(0, 3) ?? "vid") + hash;
    };

    setState((prev) => ({
      ...prev,
      videoPairs: [
        ...prev.videoPairs,
        {
          id: generateMediaId(),
          videoId,
          coverId: imageId,
          ref: generateVideoRef(),
          categoryId: category?.id,
          subCategoryId: subCategory?.id,
          platformId: platform?.id,
          creatorId,
          creatorName: creator,
          videoType,
          tags: selectedTags
            .filter((tag): tag is { id: string; name: string } => typeof tag.id === "string")
            .map((tag) => ({ id: tag.id, name: tag.name })),
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

  const addTag = (tag: { id?: string; name: string }) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
      setTagQuery("");
      setShowTagDropdown(false);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const addTagByName = async (name: string) => {
    if (name.trim() === "") return;
    const newTag = { name: name.trim() };
    addTag(newTag);
  };

  const updateVideoMetadata = (videoId: string, metadata: Partial<BulkVideoItem>) => {
    setState((prev) => ({
      ...prev,
      videoPairs: prev.videoPairs.map((p) =>
        p.videoId === videoId ? { ...p, ...metadata } : p
      ),
    }));
  };

  const videos = mediaFiles.filter((m) => m.type === "video");
  const images = mediaFiles.filter((m) => m.type === "image");
  const unpairedVideos = videos.filter(
    (v) => !videoPairs.some((p) => p.videoId === v.id)
  );
  const pairedVideos = videoPairs.filter((p) => p.videoId);

  // Auto-pair videos and images with same filename
  useEffect(() => {
    const getFileNameWithoutExt = (name: string) => name.split('.').slice(0, -1).join('.');
    
    const generateVideoRef = (videoId: string) => {
      const hash = Md5.hashStr(
        videoId + Date.now().toString()
      ).slice(0, 8);
      return (user?.username?.slice(0, 3) ?? "vid") + hash;
    };

    const newPairs: BulkVideoItem[] = [];
    const pairedImageIds = new Set(videoPairs.map((p) => p.coverId).filter(Boolean));
    const pairedVideoIds = new Set(videoPairs.map((p) => p.videoId).filter(Boolean));

    videos.forEach((video) => {
      if (pairedVideoIds.has(video.id)) return; // Already paired
      
      const videoNameWithoutExt = getFileNameWithoutExt(video.name);
      const matchingImage = images.find((img) => {
        if (pairedImageIds.has(img.id)) return false; // Already paired
        const imgNameWithoutExt = getFileNameWithoutExt(img.name);
        return videoNameWithoutExt === imgNameWithoutExt;
      });

      if (matchingImage) {
        newPairs.push({
          id: generateMediaId(),
          videoId: video.id,
          coverId: matchingImage.id,
          ref: generateVideoRef(video.id),
        });
        pairedImageIds.add(matchingImage.id);
      }
    });

    if (newPairs.length > 0) {
      setState((prev) => ({
        ...prev,
        videoPairs: [...prev.videoPairs, ...newPairs],
      }));
    }
  }, [mediaFiles.length]);

  const handleBulkUpload = useCallback(async () => {
    if (!category || videoPairs.length === 0) {
      toast.error(t("videos.upload.errors.required_fields"));
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentUploadIndex(0);

      const uploadedCount = videoPairs.length;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < videoPairs.length; i++) {
        const pair = videoPairs[i];
        setCurrentUploadIndex(i + 1);

        const videoMedia = mediaFiles.find((m) => m.id === pair.videoId);
        const coverMedia = mediaFiles.find((m) => m.id === pair.coverId);

        if (!videoMedia || !coverMedia) {
          errorCount++;
          continue;
        }

        try {
          const tagData = selectedTags.map((tag) => ({
            id: typeof tag.id === "string" && tag.id.startsWith("temp_") ? undefined : tag.id,
            name: tag.name,
          }));

          await uploadVideoBulk(
            videoMedia.file,
            coverMedia.file,
            category.id,
            subCategory?.id,
            platform?.id,
            creatorId,
            creator,
            pair.ref || "",
            pair.titles || {},
            videoType === "short",
            tagData,
            (progressEvent) => {
              if (progressEvent.total) {
                const fileProgress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                const overallProgress = Math.round(
                  ((i + fileProgress / 100) * 100) / videoPairs.length
                );
                setUploadProgress(overallProgress);
              }
            }
          );

          successCount++;
          toast.success(
            t("videos.upload.bulk.upload_success")
              .replace("{name}", videoMedia.name)
              .replace("{current}", String(i + 1))
              .replace("{total}", String(uploadedCount))
          );
        } catch (err: any) {
          errorCount++;
          toast.error(
            t("videos.upload.errors.upload")
              .replace(
                "{message}",
                String(err.response?.data?.message || err.message)
              )
              .replace("{name}", videoMedia.name)
          );
        }
      }

      setUploadProgress(100);

      if (successCount === uploadedCount) {
        toast.success(
          t("videos.upload.bulk.all_success").replace("{count}", String(successCount))
        );
        reFetch && reFetch();
        setTimeout(() => navigate("/videos"), 1500);
      } else {
        toast.error(
          t("videos.upload.bulk.partial_error")
            .replace("{success}", String(successCount))
            .replace("{error}", String(errorCount))
        );
      }
    } catch (err: any) {
      console.error(err);
      toast.error(t("videos.upload.errors.upload_failed"));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadIndex(0);
    }
  }, [
    category,
    videoPairs,
    mediaFiles,
    selectedTags,
    videoType,
    subCategory,
    platform,
    creatorId,
    creator,
    navigate,
    reFetch,
    t,
  ]);

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
            videoPreviewMap={Object.fromEntries(videos.map((v) => [v.id, v.preview]))}
          />
        )}

        {/* Metadata Section */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category & Platform */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                {t("videos.upload.category.title")}
              </h3>
              <div className="space-y-4">
                <div>
                  <CategoryAutoComplete 
                    onSelect={(cat: any) => {
                      setCategory(cat);
                      setSubCategory(null);
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("videos.upload.subcategory.label")}
                  </label>
                  <SubCategoryAutoComplete
                    onSelect={(sub: any) => setSubCategory(sub)}
                    categoryId={category?.id}
                  />
                </div>
              </div>
            </div>

            {/* Platform & Video Type */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-600" />
                {t("videos.upload.platform.title")}
              </h3>
              <div className="space-y-4">
                <div>
                  <PlatformSelectComponent 
                    onSelect={(plat: any) => setPlatform(plat)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("videos.upload.video_type.label")}
                  </label>
                  <div className="relative">
                    <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      className="w-full appearance-none pl-10 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all"
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value as "short" | "long")}
                    >
                      <option value="short">{t("videos.type.short")}</option>
                      <option value="long">{t("videos.type.long")}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Creator & Tags Section */}
        {mediaFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              {t("videos.upload.creator_tags.title")}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("videos.upload.creator.label")}
                </label>
                <CreatorAutoComplete
                  value={creator}
                  onChange={(v: string | null) => {
                    setCreator(v);
                    setCreatorId(null);
                  }}
                  onSelect={(c: any) => {
                    setCreator(c?.name ?? null);
                    setCreatorId(c?.id ?? null);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("videos.upload.tags.label")}
                </label>
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={tagQuery}
                        onChange={(e) => {
                          setTagQuery(e.target.value);
                          setShowTagDropdown(true);
                        }}
                        onFocus={() => setShowTagDropdown(true)}
                        onBlur={() => setTimeout(() => setShowTagDropdown(false), 200)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTagByName(tagQuery);
                          }
                        }}
                        placeholder={t("videos.upload.tags.placeholder")}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all"
                      />
                      <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => addTagByName(tagQuery)}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition flex items-center gap-2 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showTagDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto"
                      >
                        {filteredTagSuggestions && filteredTagSuggestions?.length > 0 ? (
                          filteredTagSuggestions?.map((tag: any, idx: number) => (
                            <motion.button
                              key={tag.id || idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                addTag(tag);
                                setShowTagDropdown(false);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300 text-sm first:rounded-t-lg last:rounded-b-lg"
                            >
                              {tag.name}
                            </motion.button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                            {tagQuery.trim() ? "Aucun tag ne correspond" : "Commencez à taper pour filtrer"}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <AnimatePresence>
                    {selectedTags.map((tag) => (
                      <motion.span
                        key={tag.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag.name}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag.id)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Upload en cours
                </h3>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {currentUploadIndex} / {videoPairs.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {uploadProgress}%
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {mediaFiles.length > 0 && (
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => navigate("/videos")}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleBulkUpload}
              disabled={pairedVideos.length === 0 || isUploading}
              className={`px-5 py-2.5 rounded-lg font-medium transition ${
                pairedVideos.length === 0 || isUploading
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isUploading ? (
                <>
                  <span className="inline-block mr-2">⏳</span>
                  Upload en cours...
                </>
              ) : (
                `Continuer (${pairedVideos.length})`
              )}
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
  videoPreviewMap?: Record<string, string>;
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
  videoPreviewMap = {},
}) => {
  const [openCoverSelector, setOpenCoverSelector] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const videoPreviewMapRef = useRef<Record<string, string>>({});

  const isCoverPaired = (imageId: string) => videoPairs.some((p) => p.coverId === imageId);
  const getCoverForVideo = (videoId: string) => videoPairs.find((p) => p.videoId === videoId)?.coverId;
  
  // Memoize to ensure consistency
  const getAvailableCoverImages = (excludeVideoId?: string) => {
    return images.filter((i) => {
      const paired = isCoverPaired(i.id);
      return !paired;
    });
  };

  // Update the ref whenever videoPreviewMap changes
  useEffect(() => {
    videoPreviewMapRef.current = videoPreviewMap;
  }, [videoPreviewMap]);

  // Force video reload when videos array length changes (new uploads)
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([videoId, video]) => {
      if (video && video.src) {
        video.load();
      }
    });
  }, [videos.length]);

  // Ensure videos load their src when component mounts or videos change
  useEffect(() => {
    videos.forEach((video) => {
      const videoEl = videoRefs.current[video.id];
      if (videoEl && !videoEl.src) {
        videoEl.src = video.preview;
      }
    });
  }, [videos]);

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
                    <div className="w-24 h-16 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden border border-blue-200 dark:border-blue-900 cursor-pointer group">
                      <video 
                        key={`video-${video.id}`}
                        ref={(el) => {
                          if (el) {
                            videoRefs.current[video.id] = el;
                            if (!el.src) {
                              el.src = video.preview;
                            }
                          }
                        }}
                        src={video.preview}
                        className="w-full h-full object-cover bg-gray-300 dark:bg-gray-600"
                        muted
                        playsInline
                        crossOrigin="anonymous"
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          const videoEl = e.currentTarget as HTMLVideoElement;
                          videoEl.currentTime = 1;
                        }}
                        onCanPlay={(e) => {
                          const videoEl = e.currentTarget as HTMLVideoElement;
                          if (videoEl.currentTime === 0) {
                            videoEl.currentTime = 1;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
                    </div>
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-md z-10">
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
                        key={`cover-display-${pairedCover.id}`}
                        src={pairedCover.preview}
                        alt="cover"
                        className="w-full h-full object-cover bg-gray-200 dark:bg-gray-700"
                        crossOrigin="anonymous"
                        decoding="async"
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
                              key={`cover-grid-${cover.id}`}
                              src={cover.preview}
                              alt={cover.name}
                              className="w-full h-full object-cover bg-gray-200 dark:bg-gray-700"
                              crossOrigin="anonymous"
                              decoding="async"
                              loading="lazy"
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