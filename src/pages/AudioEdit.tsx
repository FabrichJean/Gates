import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Upload, 
  Image as ImageIcon,
  User,
  Globe,
  Tag,
  Music,
  Clock,
  X,
  Save,
  Loader2,
  ChevronDown,
  Check,
  Volume2,
  ChevronLeft
} from "lucide-react";
import { getAudioByIdApi, updateAudio } from "../api/audios";
import { getCreators } from "../api/creators";
import { getAllPlateformsApi } from "../api/plateforms";
import { getTagCategoriesApi } from "../api/tagCategory";
import { getAudioCategoriesApi } from "../api/audioCategory";
import { getAudioSubCategoriesApi } from "../api/audioSubCategory";
import { AudioTitlesField } from "../components/AudioTitlesField";
import toast from "react-hot-toast";
import { useNavigate, useParams, Link } from "react-router-dom";

import type { AudioTitle } from "../components/AudioTitlesField";
import { getAudioTagCategoriesApi } from "../api/audioTagCategory";

const SexyLoader = () => (
  <div className="relative w-16 h-16 mx-auto">
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 animate-pulse" />
    <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-white/80 animate-spin" />
  </div>
);

const AudioEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [form, setForm] = useState({
    ref: "",
    title: "",
    description: "",
    titles: [] as AudioTitle[],
    audio_category_id: "",
    audio_sub_category_id: "",
    plateform_id: "",
    tagCategories: [] as Array<number | { name: string }>,
    creator_id: "",
    duration: "",
    need_vip: false,
    cover: null as File | null,
    audio: null as File | null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creators, setCreators] = useState<any[]>([]);
  const [plateforms, setPlateforms] = useState<any[]>([]);
  const [tagCategories, setTagCategories] = useState<any[]>([]);
  const [audioCategories, setAudioCategories] = useState<any[]>([]);
  const [audioSubCategories, setAudioSubCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState<any[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
  const creatorDropdownRef = useRef<HTMLDivElement>(null);

  // Load audio data
  useEffect(() => {
    const fetchAudio = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const audio = await getAudioByIdApi(id);
        
        setForm({
          ref: audio.ref || "",
          title: audio.title || "",
          description: audio.description || "",
          titles: (audio.titles || []).map((t: any) => ({
            i18_language: t.i18_language,
            language_code: t.language_code ?? t.i18_language ?? "",
            title: t.title,
            description: t.description,
          })),
          audio_category_id: audio.audio_category_id?.toString() || "",
          audio_sub_category_id: audio.audio_sub_category_id?.toString() || "",
          plateform_id: audio.plateform_id?.toString() || "",
          tagCategories: audio.tagCategories?.map((tag: any) => tag.id || tag) || [],
          creator_id: audio.creator_id?.toString() || "",
          duration: audio.duration?.toString() || "",
          need_vip: audio.need_vip || false,
          cover: null,
          audio: null,
        });

        setExistingCoverUrl(audio.cover_url || audio.s3_cover_url);
        setExistingAudioUrl(audio.audio_url || audio.s3_audio_url);
      } catch (error) {
        console.error("Error fetching audio:", error);
        toast.error("Erreur lors du chargement de l'audio");
        nav("/audios");
      } finally {
        setLoading(false);
      }
    };

    fetchAudio();
  }, [id, nav]);

  // Load dropdowns data
  useEffect(() => {
    Promise.all([
      getCreators().then((res) => setCreators(res.data || res)).catch(() => setCreators([])),
      getAllPlateformsApi().then((res) => setPlateforms(res.data || res)).catch(() => setPlateforms([])),
      getAudioTagCategoriesApi().then((res) => {
        const tags = res.data?.items || res.data || res;
        setTagCategories(Array.isArray(tags) ? tags : []);
      }).catch(() => setTagCategories([])),
      getAudioCategoriesApi().then((res) => {
        const cats = res.data || res;
        setAudioCategories(Array.isArray(cats) ? cats : []);
      }).catch(() => setAudioCategories([])),
    ]);
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    if (form.audio_category_id) {
      getAudioSubCategoriesApi(parseInt(form.audio_category_id))
        .then((res) => {
          const subs = res.data || res;
          setAudioSubCategories(Array.isArray(subs) ? subs : []);
        })
        .catch(() => setAudioSubCategories([]));
    } else {
      setAudioSubCategories([]);
      setForm((prev) => ({ ...prev, audio_sub_category_id: "" }));
    }
  }, [form.audio_category_id]);

  // Close creator dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creatorDropdownRef.current && !creatorDropdownRef.current.contains(event.target as Node)) {
        setShowCreatorDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, cover: file });
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, audio: file });
      const reader = new FileReader();
      reader.onloadend = () => setAudioPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Auto-detect duration
      const audioElement = new Audio();
      audioElement.src = URL.createObjectURL(file);
      audioElement.addEventListener("loadedmetadata", () => {
        const durationInSeconds = Math.floor(audioElement.duration);
        setForm((prev) => ({ ...prev, duration: durationInSeconds.toString() }));
        URL.revokeObjectURL(audioElement.src);
      });
    }
  };

  const handleTagInput = (value: string) => {
    setTagInput(value);
    let filtered;
    if (value.trim()) {
      filtered = tagCategories.filter((tag) =>
        tag.name.toLowerCase().includes(value.toLowerCase())
      );
    } else {
      filtered = tagCategories;
    }
    setFilteredTags(filtered);
    setShowTagDropdown(true);
  };

  const addTag = (tag: any) => {
    if (!form.tagCategories.some((t) => (typeof t === "object" ? t.name === tag.name : t === tag.id))) {
      setForm({ ...form, tagCategories: [...form.tagCategories, tag.id] });
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  const addCustomTag = () => {
    if (tagInput.trim() && !form.tagCategories.some((t) => typeof t === "object" && t.name === tagInput)) {
      setForm({ ...form, tagCategories: [...form.tagCategories, { name: tagInput.trim() }] });
      setTagInput("");
      setShowTagDropdown(false);
    }
  };

  const removeTag = (index: number) => {
    setForm({ ...form, tagCategories: form.tagCategories.filter((_, i) => i !== index) });
  };

  const getTagDisplay = (tag: number | { name: string }) => {
    if (typeof tag === "object") return tag.name;
    const found = tagCategories.find((t) => t.id === tag);
    return found ? found.name : "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      
      if (form.ref) formData.append("ref", form.ref);
      if (form.description) formData.append("description", form.description);
      if (form.audio_category_id) formData.append("audio_category_id", form.audio_category_id);
      if (form.audio_sub_category_id) formData.append("audio_sub_category_id", form.audio_sub_category_id);
      if (form.plateform_id) formData.append("plateform_id", form.plateform_id);
      if (form.creator_id) formData.append("creator_id", form.creator_id);
      if (form.duration) formData.append("duration", form.duration);
      formData.append("need_vip", form.need_vip ? "1" : "0");

      if (form.cover) formData.append("cover", form.cover);
      if (form.audio) formData.append("audio", form.audio);

      if (form.titles.length > 0) {
        formData.append("titles", JSON.stringify(form.titles));
      }

      const processedTags = form.tagCategories.map((tag) =>
        typeof tag === "object" ? { name: tag.name } : tag
      );
      formData.append("tagCategories", JSON.stringify(processedTags));

      await updateAudio(id!, formData);
      toast.success("Audio mis à jour avec succès!");
      nav(`/audios/${id}`);
    } catch (error: any) {
      console.error("Error updating audio:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <SexyLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
        <Link
          to={`/audios/${id}`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour aux détails
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
            <Music className="w-10 h-10 text-indigo-500" />
            Modifier l'audio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Modifiez les informations de votre audio
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Files */}
            <div className="lg:col-span-1 space-y-6">
              {/* Cover Upload */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" />
                  Image de couverture
                </label>
                
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="relative block aspect-square rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all"
                  >
                    {coverPreview || existingCoverUrl ? (
                      <>
                        <img
                          src={coverPreview || existingCoverUrl || ""}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-12 h-12 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-3" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Cliquez pour {existingCoverUrl ? "changer" : "ajouter"}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </motion.div>

              {/* Audio Upload */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-indigo-500" />
                  Fichier audio
                </label>

                <div className="space-y-4">
                  {/* Existing Audio */}
                  {existingAudioUrl && !audioPreview && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <audio controls className="w-full mb-2">
                        <source src={existingAudioUrl} />
                      </audio>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Audio actuel
                      </p>
                    </div>
                  )}

                  {/* New Audio Preview */}
                  {audioPreview && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
                      <audio controls className="w-full mb-2">
                        <source src={audioPreview} />
                      </audio>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 text-center font-medium">
                        Nouvel audio
                      </p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer font-medium"
                  >
                    <Upload className="w-5 h-5" />
                    {existingAudioUrl || audioPreview ? "Remplacer l'audio" : "Téléverser un audio"}
                  </label>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
            >
              <div className="space-y-6">
                {/* Ref */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={form.ref}
                    onChange={(e) => setForm({ ...form, ref: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                    placeholder="Entrez une référence unique"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Catégorie
                  </label>
                  <select
                    value={form.audio_category_id}
                    onChange={(e) => setForm({ ...form, audio_category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {audioCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category */}
                {form.audio_category_id && audioSubCategories.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Sous-catégorie
                    </label>
                    <select
                      value={form.audio_sub_category_id}
                      onChange={(e) => setForm({ ...form, audio_sub_category_id: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                    >
                      <option value="">Sélectionnez une sous-catégorie</option>
                      {audioSubCategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Durée (en secondes)
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                    placeholder="Auto-détecté depuis le fichier audio"
                  />
                </div>

                {/* Creator */}
                <div ref={creatorDropdownRef}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Créateur
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCreatorDropdown(!showCreatorDropdown)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-left flex items-center justify-between text-gray-900 dark:text-gray-100"
                    >
                      <span>
                        {form.creator_id
                          ? creators.find((c) => c.id === parseInt(form.creator_id))?.name || "Sélectionner"
                          : "Sélectionnez un créateur"}
                      </span>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>

                    {showCreatorDropdown && (
                      <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                        {creators.map((creator) => (
                          <button
                            key={creator.id}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, creator_id: creator.id.toString() });
                              setShowCreatorDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between text-gray-900 dark:text-gray-100"
                          >
                            <span>{creator.name}</span>
                            {form.creator_id === creator.id.toString() && (
                              <Check className="w-5 h-5 text-indigo-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Plateforme
                  </label>
                  <select
                    value={form.plateform_id}
                    onChange={(e) => setForm({ ...form, plateform_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Sélectionnez une plateforme</option>
                    {plateforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => handleTagInput(e.target.value)}
                      onFocus={() => handleTagInput(tagInput)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (filteredTags.length > 0) {
                            addTag(filteredTags[0]);
                          } else {
                            addCustomTag();
                          }
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all text-gray-900 dark:text-gray-100"
                      placeholder="Tapez pour rechercher ou créer un tag..."
                    />

                    {showTagDropdown && filteredTags.length > 0 && (
                      <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                        {filteredTags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => addTag(tag)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                          >
                            {tag.name}
                          </button>
                        ))}
                        {tagInput && (
                          <button
                            type="button"
                            onClick={addCustomTag}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-indigo-600 dark:text-indigo-400 font-medium border-t border-gray-200 dark:border-gray-700"
                          >
                            + Créer "{tagInput}"
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Tags */}
                  {form.tagCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.tagCategories.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                        >
                          {getTagDisplay(tag)}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Multilingual Titles */}
                <AudioTitlesField
                  value={form.titles}
                  onChange={(titles) => setForm({ ...form, titles })}
                  label="Titres multilingues (optionnel)"
                  required={false}
                />

                {/* VIP Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                  <input
                    type="checkbox"
                    id="need_vip"
                    checked={form.need_vip}
                    onChange={(e) => setForm({ ...form, need_vip: e.target.checked })}
                    className="w-5 h-5 text-indigo-500 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="need_vip" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    Réservé aux utilisateurs VIP
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/audios/${id}`}
                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-center"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AudioEdit;
