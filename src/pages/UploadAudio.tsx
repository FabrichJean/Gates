import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
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
  Volume2
} from "lucide-react";
import { createAudioApi } from "../api/audios";
import { getCreators } from "../api/creators";
import { getAllPlateformsApi } from "../api/plateforms";
import { getTagCategoriesApi } from "../api/tagCategory";
import { getAudioCategoriesApi } from "../api/audioCategory";
import { getAudioSubCategoriesApi } from "../api/audioSubCategory";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface AudioTitle {
  i18_language: string;
  language_code: string;
  title: string;
  description: string;
}

const UploadAudio: React.FC = () => {
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

  const [loading, setLoading] = useState(false);
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
  const creatorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getCreators().then((res) => setCreators(res.data || res)).catch(() => setCreators([])),
      getAllPlateformsApi().then((res) => setPlateforms(res.data || res)).catch(() => setPlateforms([])),
      getTagCategoriesApi().then((res) => {
        const tags = res.data?.data || res.data || res;
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
      setForm((prev) => ({ ...prev, cover: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, audio: file }));
      setAudioPreview(URL.createObjectURL(file));
      
      // Auto-detect duration
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        setForm((prev) => ({ ...prev, duration: Math.floor(audio.duration).toString() }));
      };
    }
  };

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    if (value.trim()) {
      const filtered = tagCategories.filter((tag) =>
        tag.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowTagDropdown(true);
    } else {
      setShowTagDropdown(false);
    }
  };

  const addTag = (tag: any) => {
    if (!form.tagCategories.some((t) => typeof t === "number" ? t === tag.id : t.name === tag.name)) {
      setForm((prev) => ({
        ...prev,
        tagCategories: [...prev.tagCategories, tag.id],
      }));
    }
    setTagInput("");
    setShowTagDropdown(false);
  };

  const addCustomTag = () => {
    if (tagInput.trim() && !form.tagCategories.some((t) => typeof t !== "number" && t.name === tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tagCategories: [...prev.tagCategories, { name: tagInput.trim() }],
      }));
      setTagInput("");
      setShowTagDropdown(false);
    }
  };

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tagCategories: prev.tagCategories.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    if (!form.audio) {
      toast.error("Le fichier audio est requis");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("ref", form.ref);
      formData.append("title", form.title);
      formData.append("description", form.description);
      
      if (form.audio_category_id) {
        formData.append("audio_category_id", form.audio_category_id);
      }
      if (form.audio_sub_category_id) {
        formData.append("audio_sub_category_id", form.audio_sub_category_id);
      }
      if (form.plateform_id) {
        formData.append("plateform_id", form.plateform_id);
      }
      if (form.creator_id) {
        formData.append("creator_id", form.creator_id);
      }
      if (form.duration) {
        formData.append("duration", form.duration);
      }
      
      formData.append("need_vip", form.need_vip.toString());
      
      // Tags
      formData.append("tagCategories", JSON.stringify(form.tagCategories));
      
      // Titles (i18n)
      if (form.titles.length > 0) {
        formData.append("titles", JSON.stringify(form.titles));
      }
      
      // Files
      if (form.cover) {
        formData.append("cover", form.cover);
      }
      if (form.audio) {
        formData.append("audio", form.audio);
      }

      const result = await createAudioApi(formData);
      toast.success("Audio créé avec succès!");
      nav(`/audios/${result.id}`);
    } catch (error) {
      console.error("Error creating audio:", error);
      toast.error("Erreur lors de la création de l'audio");
    } finally {
      setLoading(false);
    }
  };

  const getTagDisplay = (tag: number | { name: string }) => {
    if (typeof tag === "number") {
      return tagCategories.find((t) => t.id === tag)?.name || "Unknown";
    }
    return tag.name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Créer un Audio
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Téléchargez un nouveau fichier audio dans votre bibliothèque
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Files */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Cover Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Couverture
                </h3>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                    id="cover-input"
                  />
                  <label
                    htmlFor="cover-input"
                    className="block cursor-pointer"
                  >
                    {coverPreview ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900/50">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Cliquez pour uploader
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Audio Upload */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Fichier Audio
                </h3>
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                    id="audio-input"
                  />
                  <label
                    htmlFor="audio-input"
                    className="block cursor-pointer"
                  >
                    {audioPreview ? (
                      <div className="rounded-xl border-2 border-green-500 dark:border-green-400 p-4 bg-green-50 dark:bg-green-900/20">
                        <audio controls className="w-full mb-2">
                          <source src={audioPreview} />
                        </audio>
                        <p className="text-sm text-green-600 dark:text-green-400 text-center flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Fichier chargé
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900/50 py-8">
                        <Music className="w-12 h-12 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Cliquez pour uploader
                        </span>
                        <span className="text-xs text-gray-400">
                          MP3, WAV, OGG, etc.
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg space-y-6">
                {/* Ref */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={form.ref}
                    onChange={(e) => setForm((prev) => ({ ...prev, ref: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="REF-001"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Nom de l'audio"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Description de l'audio..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={form.audio_category_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, audio_category_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {audioCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category */}
                {form.audio_category_id && audioSubCategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sous-catégorie
                    </label>
                    <select
                      value={form.audio_sub_category_id}
                      onChange={(e) => setForm((prev) => ({ ...prev, audio_sub_category_id: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez une sous-catégorie</option>
                      {audioSubCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Durée (secondes)
                  </label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Détecté automatiquement"
                  />
                </div>

                {/* Creator */}
                <div ref={creatorDropdownRef}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Créateur
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCreatorDropdown(!showCreatorDropdown)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-left flex items-center justify-between"
                    >
                      <span>
                        {form.creator_id
                          ? creators.find((c) => c.id === parseInt(form.creator_id))?.name || "Sélectionnez un créateur"
                          : "Sélectionnez un créateur"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {showCreatorDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                        >
                          {creators.map((creator) => (
                            <button
                              key={creator.id}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({ ...prev, creator_id: creator.id.toString() }));
                                setShowCreatorDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                            >
                              {creator.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Plateform */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Plateforme
                  </label>
                  <select
                    value={form.plateform_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, plateform_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">Sélectionnez une plateforme</option>
                    {plateforms.map((plateform) => (
                      <option key={plateform.id} value={plateform.id}>
                        {plateform.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => handleTagInputChange(e.target.value)}
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Rechercher ou créer un tag..."
                      />
                      
                      <AnimatePresence>
                        {showTagDropdown && filteredTags.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                          >
                            {filteredTags.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => addTag(tag)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-gray-100"
                              >
                                {tag.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {form.tagCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <AnimatePresence mode="popLayout">
                          {form.tagCategories.map((tag, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium"
                            >
                              <span>{getTagDisplay(tag)}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                {/* Need VIP */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="need_vip"
                    checked={form.need_vip}
                    onChange={(e) => setForm((prev) => ({ ...prev, need_vip: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="need_vip" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      VIP
                    </span>
                    Réservé aux membres VIP
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Créer l'audio
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UploadAudio;
