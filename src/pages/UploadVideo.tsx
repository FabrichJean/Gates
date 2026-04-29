/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Film,
  Image,
  User,
  Globe,
  Tag,
  FileVideo,
  FileImage,
  X,
  Loader2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import LanguageAutoComplete from "../components/LanguageAutoComplete";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CategoryAutoComplete, {
  type Category,
} from "../components/CategoryAutoComplete";
import { uploadVideo } from "../api/videos";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import { useAuthMe } from "../hooks/useAuth";
import { Md5 } from "ts-md5";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import type { Platform } from "../hooks/usePlatform";
import { useVideosContext } from "../context/VideosContext";
import { getTagCategoriesApi } from "../api/tagCategory";
import { BiUpload } from "react-icons/bi";
import axios from "axios";
import { translateServer } from "../constant";
import { useI18n } from "../i18n";
import UploadChoiceModal, {
  type UploadChoice,
} from "../components/videos/upload.modal.confirmation";

export type Couple = {
  language: any;
  id: any;
  i18_language: string;
  title: string;
  name?: string;
  description?: string;
};

type Props = {
  coupleTitles: Couple[];
  setCoupleTitles: React.Dispatch<React.SetStateAction<Couple[]>>;
  btnSubmit?: React.ReactNode;
  uploading?: boolean;
  progress?: number;
  handleSubmit: () => void;
};

export function TitlesForm({
  progress,
  uploading,
  handleSubmit: submit,
  btnSubmit,
  coupleTitles,
  setCoupleTitles,
}: Props) {
  const { t } = useI18n();
  /* ---------- logique existante ---------- */
  const handleChange = (index: number, field: keyof Couple, value: string) => {
    const newCouples = [...coupleTitles];
    (newCouples[index] as any)[field] = value;
    setCoupleTitles(newCouples);
  };

  const addCouple = () =>
    setCoupleTitles((c) => [
      ...c,
      {
        id: null,
        language: null,
        i18_language: "",
        title: "",
        description: "",
      },
    ]);

  const removeCouple = (index: number) => {
    setCoupleTitles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---------- nouveau : modal “auto” ---------- */
  const [isLoading, setLoading] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoTitle, setAutoTitle] = useState("");
  const [autoDesc, setAutoDesc] = useState("");
  const [server, setServer] = useState(translateServer);

  const [selectedLanguages, setSelectedLanguages] = useState<
    Array<{ code: string; name: string }>
  >([]);

  const applyAuto = async () => {
    setLoading(true);
    const i18ns = await axios.post<Couple[]>(server, {
      title: autoTitle,
      description: autoDesc,
      i18n:
        selectedLanguages.length === 0
          ? null
          : selectedLanguages.map((l) => l.code),
    });

    setCoupleTitles(i18ns.data);

    setLoading(false);
    setAutoOpen(false);
    setAutoTitle("");
    setAutoDesc("");
    setSelectedLanguages([]);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      {/* ---------- header ---------- */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <FileVideo className="w-5 h-5" />
          {t("videos.upload.titles.title")}
        </h3>

        <div className="flex items-center gap-2">
          {/* bouton Auto */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setAutoOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            {t("videos.upload.titles.auto")}
          </motion.button>

          {/* bouton Add Language */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={addCouple}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            {t("videos.upload.titles.add_language")}
          </motion.button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ---------- liste des couples ---------- */}
      <div className="space-y-6">
        <AnimatePresence>
          {coupleTitles?.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="absolute top-2 right-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => removeCouple(i)}
                  className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {/* Language { JSON.stringify(c.language) } */}
                  </label>
                  <LanguageAutoComplete
                    defaultValue={{
                      code: c?.language?.title,
                      name: c?.language?.name!,
                    }}
                    onSelect={(lang) =>
                      handleChange(i, "i18_language", lang.code)
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("videos.upload.titles.title_label")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("videos.upload.titles.title_placeholder")}
                    value={c.title}
                    onChange={(e) => handleChange(i, "title", e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("videos.upload.titles.description_label")}
                </label>
                <textarea
                  placeholder={t("videos.upload.titles.description_placeholder")}
                  value={c.description}
                  onChange={(e) =>
                    handleChange(i, "description", e.target.value)
                  }
                  className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300 resize-none"
                  rows={3}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ---------- bouton principal ---------- */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={submit}
        disabled={uploading}
        className={`w-full mt-6 flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${uploading
          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          : "rounded-lg border shadow-lg hover:shadow-xl"
          }`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {t("videos.upload.progress.with_percent").replace(
                "{progress}",
                String(progress ?? 0)
              )}
            </span>
          </>
        ) : (
          <>
            <span className="text-lg">
              {btnSubmit ? btnSubmit : t("videos.upload.titles.submit_default")}
            </span>
          </>
        )}
      </motion.button>

      {/* ---------- Modal DaisyUI ---------- */}
      <input
        type="checkbox"
        checked={autoOpen}
        onChange={() => setAutoOpen((o) => !o)}
        className="modal-toggle"
      />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
          <h3 className="font-bold text-lg mb-4">
            {t("videos.upload.auto.title")}
          </h3>

          {/* champ select multiple language */}

          <div className="form-control w-full mb-4">
            <div className="flex space-x-1.5 items-center">
              <label className="label">
                <span className="label-text">
                  {selectedLanguages.length === 0
                    ? t("common.all")
                    : t("videos.upload.auto.languages.selected").replace(
                      "{count}",
                      String(selectedLanguages.length)
                    )}
                </span>
              </label>
            </div>

            <LanguageAutoComplete
              onSelect={(lang) => {
                if (!lang) return;

                const exists = selectedLanguages.find(
                  (l) => l.code === lang.code
                );
                if (exists) return;

                setSelectedLanguages((prev) => [
                  ...prev,
                  { code: lang.code, name: lang.name },
                ]);
              }}
            />

            {/* Selected languages */}
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedLanguages.map((lang, index) => (
                <span
                  key={lang.code}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                >
                  {lang.name}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedLanguages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">
                {t("videos.upload.auto.title_label")}
              </span>
            </label>
            <input
              type="text"
              placeholder={t("videos.upload.auto.title_placeholder")}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
              value={autoTitle}
              onChange={(e) => setAutoTitle(e.target.value)}
            />
          </div>

          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text">
                {t("videos.upload.auto.description_label")}
              </span>
            </label>
            <textarea
              placeholder={t("videos.upload.auto.description_placeholder")}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
              rows={3}
              value={autoDesc}
              onChange={(e) => setAutoDesc(e.target.value)}
            />
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">
                {t("videos.upload.auto.server_label")}
              </span>
            </label>
            <input
              type="text"
              placeholder={t("videos.upload.auto.server_placeholder")}
              className="text-xs w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
              value={server}
              onChange={(e) => setServer(e.target.value)}
            />
          </div>

          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={() => setAutoOpen(false)}
            >
              {t("common.cancel")}
            </button>
            <button className="btn btn-primary" onClick={applyAuto}>
              {t("common.apply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type UploadState = {
  videoFile: File | null;
  coverFile: File | null;
  videoPreview: string | null;
  coverPreview: string | null;
};

const initialUploadState: UploadState = {
  videoFile: null,
  coverFile: null,
  videoPreview: null,
  coverPreview: null,
};

function uploadReducer(
  state: UploadState,
  action: Partial<UploadState>
): UploadState {
  return { ...state, ...action };
}

const Upload = () => {
  const ctx = useVideosContext();
  if (!ctx) return null;

  const { reFetch } = ctx;
  const { data: user } = useAuthMe();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);
  const { videoFile, coverFile, videoPreview, coverPreview } = state;

  const [needVip, setNeedVip] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadChoice, setUploadChoice] = useState<UploadChoice>("simple");

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<Category>();
  const [subcategory, setSubCategory] = useState<SubCategory>();
  const [platform, setPlatform] = useState<Platform>();
  const [creator, setCreator] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<number | null>(null);
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>([]);
  const [videoType, setVideoType] = useState<string>("long");
  const [availableTags, setAvailableTags] = useState<
    Array<{ id?: number; name: string; meta?: any }>
  >([]);
  const [tagQuery, setTagQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    Array<{ id?: number; name: string; meta?: any }>
  >([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const tagWrapperRef = useRef<HTMLDivElement | null>(null);
  const [selectedTagCategories, setSelectedTagCategories] = useState<
    Array<{ id?: number; name: string; meta?: any }>
  >([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [ref, setRef] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && user?.username) {
      const hash = Md5.hashStr(
        user.id.toString() + Date.now().toString()
      ).slice(0, 8);
      setRef(user.username.slice(0, 3) + hash);
    }
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTagCategoriesApi();
        const items = res.data.items || [];
        const normalized = items.map((it: any) => ({
          id: it.id,
          name: it.name,
          meta: it.meta ?? null,
        }));
        setAvailableTags(normalized);
        setSuggestions(normalized);
      } catch (err) {
        console.warn("Failed to load tag categories", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!tagQuery) {
      setSuggestions(availableTags);
      return;
    }
    const q = tagQuery.toLowerCase();
    setSuggestions(
      availableTags.filter((t) => t.name.toLowerCase().includes(q))
    );
  }, [tagQuery, availableTags]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!tagWrapperRef.current) return;
      if (!tagWrapperRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [coverPreview, videoPreview]);

  const handleFileChange = useCallback(
    (file: File, type: "video" | "cover") => {
      const preview = URL.createObjectURL(file);
      if (type === "video")
        dispatch({ videoFile: file, videoPreview: preview });
      else dispatch({ coverFile: file, coverPreview: preview });
    },
    []
  );

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) handleFileChange(file, "video");
    else toast.error(t("videos.upload.errors.video_only"));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) handleFileChange(file, "cover");
    else toast.error(t("videos.upload.errors.image_only"));
  };

  const handleCoverClick = () => coverInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  const addTagByName = (name: string) => {
    const n = name.trim();
    if (!n) return;
    const exists = selectedTagCategories.find(
      (t) => t.name.toLowerCase() === n.toLowerCase()
    );
    if (exists) return;
    setSelectedTagCategories((s) => [...s, { name: n }]);
    setTagQuery("");
  };

  const addSuggestion = (tag: { id?: number; name: string; meta?: any }) => {
    const existsByName = selectedTagCategories.find(
      (t) => t.name.toLowerCase() === tag.name.toLowerCase()
    );
    const existsById = tag.id
      ? selectedTagCategories.find((t) => t.id === tag.id)
      : null;
    if (existsByName || existsById) return;
    setSelectedTagCategories((s) => [
      ...s,
      { id: tag.id, name: tag.name, meta: tag.meta ?? null },
    ]);
    setTagQuery("");
  };

  const removeSelectedTag = (index: number) => {
    setSelectedTagCategories((s) => s.filter((_, i) => i !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (!videoFile || !coverFile || !category || !ref) {
      toast.error(t("videos.upload.errors.required_fields"));
      return;
    }

    const fd = new FormData();
    fd.append("video", videoFile as File);
    fd.append("cover", coverFile as File);
    fd.append("category_id", String(category.id));
    if (subcategory) fd.append("sub_category_id", String(subcategory.id));
    if (platform?.id) fd.append("plateform_id", String(platform.id));
    if (creatorId) fd.append("creator_id", String(creatorId));
    else if (creator) fd.append("creator", String(creator));
    fd.append("ref", String(ref));
    fd.append("titles", JSON.stringify(coupleTitles));
    fd.append("isShort", String(videoType === "short"));
    fd.append("need_vip", String(needVip));

    if (selectedTagCategories.length > 0) {
      const ids: number[] = [];
      const named: Array<{ name: string; meta?: any }> = [];
      selectedTagCategories.forEach((t) => {
        if (typeof t.id === "number") {
          ids.push(t.id);
        } else {
          named.push({ name: t.name, ...(t.meta ? { meta: t.meta } : {}) });
        }
      });
      const uniqIds = Array.from(new Set(ids));
      const seen = new Set<string>();
      const uniqNamed = named.filter((n) => {
        const key = n.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      const mixed: any[] = [...uniqIds, ...uniqNamed];
      fd.append("tagCategory", JSON.stringify(mixed.length > 0 ? mixed : []));
    } else {
      fd.append("tagCategory", JSON.stringify([]));
    }

    try {
      setUploading(true);
      setProgress(0);

      await uploadVideo(fd, uploadChoice, (progressEvent) => {
        if (progressEvent.total) {
          setProgress(
            Math.round((progressEvent.loaded * 100) / progressEvent.total)
          );
        }
      });

      toast.success(t("videos.upload.success"));
      reFetch && reFetch();
      navigate("/videos");
    } catch (err: any) {
      console.error(err);
      toast.error(
        t("videos.upload.errors.upload").replace(
          "{message}",
          String(err.response?.data?.message || err.message)
        )
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [
    videoFile,
    coverFile,
    category,
    subcategory,
    coupleTitles,
    ref,
    navigate,
    creator,
    creatorId,
    platform,
    videoType,
    selectedTagCategories,
    uploadChoice,
    reFetch,
  ]);

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmUpload = () => {
    setConfirmOpen(false);
    void handleSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex items-center justify-between">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("videos.upload.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t("videos.upload.subtitle")}
            </p>
          </motion.div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("videos.upload.vip_label")}
            </span>

            <button
              type="button"
              onClick={() => setNeedVip((v) => !v)}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${needVip ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${needVip ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {needVip ? t("common.true") : t("common.false")}
            </span>
          </div>
        </div>

        {/* Reference */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 mb-4">
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
        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <UploadBox
            label={t("videos.upload.cover.label")}
            onClick={handleCoverClick}
            onDrop={(f) => handleFileChange(f, "cover")}
            preview={coverPreview}
            inputRef={coverInputRef}
            accept="image/*"
            onChange={handleCoverChange}
            emptyMessage={t("videos.upload.cover.empty")}
            icon={<Image className="w-8 h-8" />}
          />

          <UploadBox
            label={t("videos.upload.video.label")}
            onClick={handleVideoClick}
            onDrop={(f) => handleFileChange(f, "video")}
            preview={videoPreview}
            inputRef={videoInputRef}
            accept="video/*"
            onChange={handleVideoChange}
            emptyMessage={t("videos.upload.video.empty")}
            icon={<FileVideo className="w-8 h-8" />}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-4">
          {/* Left Column - Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Category & Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t("videos.upload.category.title")}
                </h2>
                <CategoryAutoComplete onSelect={setCategory} />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("videos.upload.subcategory.label")}
                  </label>
                  <SubCategoryAutoComplete
                    onSelect={setSubCategory}
                    categoryId={category?.id}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t("videos.upload.platform.title")}
                </h2>
                <PlatformSelectComponent onSelect={setPlatform} />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("videos.upload.video_type.label")}
                  </label>
                  <div className="relative">
                    <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      className="w-full appearance-none pl-10 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                    >
                      <option value="short">{t("videos.type.short")}</option>
                      <option value="long">{t("videos.type.long")}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {uploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("videos.upload.progress.label")}
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        {/* Creator & Tags */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800 h-max mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t("videos.upload.creator_tags.title")}
          </h2>

          <div className="space-y-4">
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
                onSelect={(c) => {
                  setCreator(c?.name ?? null);
                  setCreatorId(c?.id ?? null);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("videos.upload.tags.label")}
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={tagQuery}
                    onChange={(e) => {
                      setTagQuery(e.target.value);
                      setShowTagDropdown(true);
                    }}
                    onFocus={() => setShowTagDropdown(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTagByName(tagQuery);
                      }
                    }}
                    placeholder={t("videos.upload.tags.placeholder")}
                    className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all duration-300"
                  />
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => addTagByName(tagQuery)}
                  className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>

              <AnimatePresence>
                {showTagDropdown && suggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className=" w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                  >
                    {suggestions?.map((s, index) => (
                      <motion.button
                        key={s.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        type="button"
                        onClick={() => {
                          addSuggestion(s);
                          setShowTagDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                      >
                        {s.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedTagCategories.map((t, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{t.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedTag(i)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
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
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <TitlesForm
            coupleTitles={coupleTitles}
            setCoupleTitles={setCoupleTitles}
            progress={progress}
            uploading={uploading}
            handleSubmit={handleOpenConfirm}
          />
        </motion.div>
      </motion.div>
      <UploadChoiceModal
        open={confirmOpen}
        choice={uploadChoice}
        onChoiceChange={setUploadChoice}
        onConfirm={handleConfirmUpload}
        onClose={handleCloseConfirm}
        uploading={uploading}
      />
    </div>
  );
};

// Upload Box Component
type UploadBoxProps = {
  label: string;
  onClick: () => void;
  onDrop: (file: File) => void;
  preview: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  emptyMessage: string;
  icon?: React.ReactNode;
};

const UploadBox = ({
  label,
  onClick,
  onDrop,
  preview,
  inputRef,
  accept,
  onChange,
  emptyMessage,
  icon,
}: UploadBoxProps) => {
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        {accept.includes("video") ? (
          <Film className="w-5 h-5" />
        ) : (
          <Image className="w-5 h-5" />
        )}
        {label}
      </h3>

      <div
        onClick={onClick}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) onDrop(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer group"
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full"
            >
              {accept.includes("video") ? (
                <video
                  src={preview}
                  controls
                  className="rounded-lg w-full max-h-56 object-cover"
                />
              ) : (
                <img
                  src={preview}
                  alt={t("videos.upload.preview_alt")}
                  className="rounded-lg object-cover w-full h-56 shadow-md"
                />
              )}
              <motion.div
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 transition-opacity duration-300"
              >
                <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <BiUpload className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {t("videos.upload.change_file")}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="mb-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                {icon ||
                  (accept.includes("video") ? (
                    <FileVideo className="w-12 h-12 mx-auto" />
                  ) : (
                    <FileImage className="w-12 h-12 mx-auto" />
                  ))}
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                {emptyMessage}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                {t("videos.upload.drop_hint")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          type="file"
          ref={inputRef}
          accept={accept}
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default Upload;
