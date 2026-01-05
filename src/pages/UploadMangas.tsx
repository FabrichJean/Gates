import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Upload, 
  Image as ImageIcon,
  User,
  Globe,
  Tag,
  BookOpen,
  Star,
  X,
  Save,
  Loader2,
  ChevronDown,
  Check
} from "lucide-react";
import { createManga } from "../api/mangas";
import { getCreators } from "../api/creators";
import { getAllPlateformsApi } from "../api/plateforms";
import { getTagCategoriesApi } from "../api/tagCategory";
import { getMangasCategoriesApi } from "../api/mangasCategory";
import { getMangasSubCategoriesApi } from "../api/mangasSubCategory";
import toast from "react-hot-toast";
import type { MangaTitles } from "../types/mangaTitles";
import { prepareTitlesForAPI } from "../utils/mangaTitlesUtils";
import { MangaTitlesField } from "../components/MangaTitlesField";
import { useNavigate } from "react-router-dom";

const UploadMangas: React.FC = () => {

  const nav = useNavigate();
  const [form, setForm] = useState({
    ref: "",
    title: "",
    description: "",
    titles: [] as MangaTitles, // Nouveau champ multilingue
    mangas_category_id: "",
    mangas_sub_category_id: "",
    plateform_id: "",
    tagCategories: [] as Array<number | { name: string }>,
    creator_id: "",
    total_chapters: "",
    need_vip: false,
    cover: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [creators, setCreators] = useState<any[]>([]);
  const [plateforms, setPlateforms] = useState<any[]>([]);
  const [tagCategories, setTagCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [filteredTags, setFilteredTags] = useState<any[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const creatorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getCreators().then((res) => setCreators(res.data || res)).catch(() => setCreators([])),
      getAllPlateformsApi().then((res) => setPlateforms(res.data || res)).catch(() => setPlateforms([])),
      getTagCategoriesApi().then((res) => {
        const tags = res.data?.data || res.data || res;
        setTagCategories(Array.isArray(tags) ? tags : []);
      }).catch(() => setTagCategories([])),
      getMangasCategoriesApi().then((res) => {
        const cats = res.data?.data || res.data || res;
        setCategories(Array.isArray(cats) ? cats : []);
      }).catch(() => setCategories([])),
    ]);
  }, []);

  // Charger les sous-catégories quand la catégorie change
  useEffect(() => {
    if (form.mangas_category_id) {
      getMangasSubCategoriesApi()
        .then((res) => {
          const subs = res.data?.data || res.data || res;
          setSubCategories(Array.isArray(subs) ? subs : []);
        })
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
    }
  }, [form.mangas_category_id]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
    
    setForm((prev) => ({
      ...prev,
      [name]: isCheckbox ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, cover: file }));
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.trim()) {
      const filtered = tagCategories.filter((tag: any) =>
        tag.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTags(filtered);
      setShowTagDropdown(true);
    } else {
      setFilteredTags([]);
      setShowTagDropdown(false);
    }
  };

  const addTag = (tag: any) => {
    const alreadyExists = form.tagCategories.some((t) => 
      typeof t === "number" ? t === tag.id : false
    );
    
    if (!alreadyExists) {
      setForm((prev) => ({
        ...prev,
        tagCategories: [...prev.tagCategories, tag.id],
      }));
    }
    setTagInput("");
    setFilteredTags([]);
    setShowTagDropdown(false);
  };

  const addCustomTag = () => {
    if (tagInput.trim()) {
      const alreadyExists = form.tagCategories.some((t) =>
        typeof t === "object" && "name" in t ? t.name === tagInput.trim() : false
      );
      
      if (!alreadyExists) {
        setForm((prev) => ({
          ...prev,
          tagCategories: [...prev.tagCategories, { name: tagInput.trim() }],
        }));
      }
      setTagInput("");
      setFilteredTags([]);
      setShowTagDropdown(false);
    }
  };

  const removeTag = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tagCategories: prev.tagCategories.filter((_, i) => i !== index),
    }));
  };

  const getTagDisplay = (tag: number | { name: string }) => {
    if (typeof tag === "number") {
      const foundTag = tagCategories.find((t: any) => t.id === tag);
      return foundTag ? foundTag.name : `Tag #${tag}`;
    }
    return tag.name;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "tagCategories") {
          formData.append("tagCategories", JSON.stringify(value));
        } else if (key === "titles") {
          // Convertir les titres multilingues en JSON string
          formData.append("titles", prepareTitlesForAPI(value as MangaTitles));
        } else if (key === "cover" && value) {
          formData.append("cover", value as File);
        } else if (key !== "cover" && key !== "titles") {
          formData.append(key, String(value));
        }
      });
      
      await createManga(formData);
      toast.success("Manga créé avec succès!");
      nav("/mangas");
      
      // Reset form
      setForm({
        ref: "",
        title: "",
        description: "",
        titles: [], // Reset titres multilingues
        mangas_category_id: "",
        mangas_sub_category_id: "",
        plateform_id: "",
        tagCategories: [],
        creator_id: "",
        total_chapters: "",
        need_vip: false,
        cover: null,
      });
      setCoverPreview(null);
      
    } catch (err: any) {
      toast.error("Erreur lors de la création du manga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Créer un Manga
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ajoutez un nouveau manga à votre collection
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 space-y-6"
          encType="multipart/form-data"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Référence (ref)
              </label>
              <input
                name="ref"
                value={form.ref}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                placeholder="Entrez la référence du manga"
                required
              />
            </div>
          </div>

          {/* Nouveau champ Titres multilingues */}
          <MangaTitlesField
            value={form.titles}
            onChange={(titles) => setForm({ ...form, titles })}
            label="Titres multilingues"
            required={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total des chapitres
              </label>
              <input
                name="total_chapters"
                value={form.total_chapters}
                onChange={handleChange}
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                placeholder="Nombre de chapitres"
              />
            </div>
          </div>

          {/* Category & Platform */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégorie
              </label>
              <div className="relative">
                <select
                  name="mangas_category_id"
                  value={form.mangas_category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 appearance-none"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sous-catégorie
              </label>
              <div className="relative">
                <select
                  name="mangas_sub_category_id"
                  value={form.mangas_sub_category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 appearance-none"
                >
                  <option value="">Sélectionner une sous-catégorie</option>
                  {subCategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Platform & Creator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Plateforme
              </label>
              <div className="relative">
                <select
                  name="plateform_id"
                  value={form.plateform_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 appearance-none"
                  required
                >
                  <option value="">Sélectionner une plateforme</option>
                  {plateforms.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Créateur
              </label>
              <div className="relative" ref={creatorDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowCreatorDropdown(!showCreatorDropdown)}
                  className="w-full px-4 py-3 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 text-left flex items-center gap-3"
                >
                  {form.creator_id ? (
                    <>
                      {creators.find((c) => c.id === Number(form.creator_id))?.avatar && (
                        <img
                          src={creators.find((c) => c.id === Number(form.creator_id))?.avatar}
                          alt="Creator"
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      {!creators.find((c) => c.id === Number(form.creator_id))?.avatar && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <User className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="flex-1">
                        {creators.find((c) => c.id === Number(form.creator_id))?.name || "Créateur sélectionné"}
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">Sélectionner un créateur</span>
                  )}
                  <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform duration-200 ${showCreatorDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCreatorDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                    >
                      {/* Option vide */}
                      <button
                        type="button"
                        onClick={() => {
                          setForm({ ...form, creator_id: "" });
                          setShowCreatorDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3 border-b border-gray-100 dark:border-gray-700"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <X className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Aucun créateur</span>
                      </button>

                      {creators.map((creator: any, index) => (
                        <motion.button
                          key={creator.id}
                          type="button"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => {
                            setForm({ ...form, creator_id: String(creator.id) });
                            setShowCreatorDropdown(false);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 flex items-center gap-3 group ${
                            form.creator_id === String(creator.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          {creator.avatar ? (
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-200">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <span className="flex-1 text-gray-700 dark:text-gray-300 text-sm font-medium">
                            {creator.name}
                          </span>
                          {form.creator_id === String(creator.id) && (
                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="relative">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onFocus={() => setShowTagDropdown(true)}
                  placeholder="Rechercher ou créer un tag..."
                  className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={!tagInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showTagDropdown && filteredTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredTags.map((tag: any, index) => (
                      <motion.button
                        key={tag.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        type="button"
                        onClick={() => addTag(tag)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                      >
                        {tag.name}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {form.tagCategories.map((tag, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-3 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                  >
                    <span>{getTagDisplay(tag)}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* VIP & Cover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  name="need_vip"
                  type="checkbox"
                  checked={form.need_vip}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Marquer comme VIP
                  </span>
                </div>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image de couverture
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer">
                  {coverPreview ? (
                    <motion.img
                      src={coverPreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cliquez pour télécharger une image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        PNG, JPG, WEBP (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              loading
                ? "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Créer le manga
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default UploadMangas;