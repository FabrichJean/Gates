import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMangaById, updateManga } from "../api/mangas";
import { getCreators } from "../api/creators";
import { getAllPlateformsApi } from "../api/plateforms";
import { getTagCategoriesApi } from "../api/tagCategory";
import { getMangasCategoriesApi } from "../api/mangasCategory";
import { getMangasSubCategoriesApi } from "../api/mangasSubCategory";
import toast from "react-hot-toast";
import type { MangaTitles } from "../types/mangaTitles";
import { parseTitlesFromAPI, prepareTitlesForAPI } from "../utils/mangaTitlesUtils";
import { MangaTitlesField } from "../components/MangaTitlesField";
import { User, Check, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cdnS3 } from "../utils/cdn";

const EditMangasPage: React.FC = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ref: "",
    title: "",
    description: "",
    titles: [] as MangaTitles, // Nouveau champ multilingue
    mangas_category_id: "",
    mangas_sub_category_id: "",
    mangas_plateform_id: "",
    tagCategories: [] as Array<number | { name: string }>,
    creator: "",
    creator_id: "",
    total_chapters: "",
    need_vip: false,
    plateform_id: "",
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
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false);
  const [creatorInput, setCreatorInput] = useState("");
  const creatorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCreators().then((res) => setCreators(res.data.creators || res)).catch(() => {});
    getAllPlateformsApi().then((res) => setPlateforms(res.data || res)).catch(() => {});
    getTagCategoriesApi()
      .then((res) => {
        let tags = res.data?.data || res.data || res;
        if (!Array.isArray(tags)) tags = [];
        setTagCategories(tags);
      })
      .catch(() => setTagCategories([]));
    getMangasCategoriesApi()
      .then((res) => {
        let cats = res.data?.data || res.data || res;
        if (!Array.isArray(cats)) cats = [];
        setCategories(cats);
      })
      .catch(() => setCategories([]));
    getMangasSubCategoriesApi()
      .then((res) => {
        let subs = res.data?.data || res.data || res;
        if (!Array.isArray(subs)) subs = [];
        setSubCategories(subs);
      })
      .catch(() => setSubCategories([]));

    if (mangaId) fetchManga();
    // eslint-disable-next-line
  }, [mangaId]);

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

  // derived selected creator
  const selectedCreator = useMemo(() => {
    return creators.find((c) => String(c.id) === String(form.creator_id));
  }, [creators, form.creator_id]);

  // sync creatorInput when selection changes or when form has a fallback creator name
  useEffect(() => {
    if (selectedCreator) {
      setCreatorInput(selectedCreator.name || "");
    } else if (form.creator) {
      setCreatorInput(form.creator || "");
    } else {
      setCreatorInput("");
    }
  }, [selectedCreator, form.creator]);

  const filteredCreators = useMemo(() => {
    const v = creatorInput.trim();
    if (!v) return creators;
    return creators.filter((cr: any) => cr.name.toLowerCase().includes(v.toLowerCase()));
  }, [creatorInput, creators]);

  const handleCreatorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorInput(e.target.value);
    setShowCreatorDropdown(true);
  };

  const selectCreator = (creator: any) => {
    setForm((prev) => ({ ...prev, creator_id: String(creator.id) }));
    setCreatorInput(creator.name || "");
    setShowCreatorDropdown(false);
  };

  const fetchManga = async () => {
    setLoading(true);
    try {
      const res = await getMangaById(Number(mangaId));
      const manga = res.data || res;
      
      // Convertir les tags au format attendu [number, number, ...]
      let tagIds: number[] = [];
      if (manga.tagCategories && Array.isArray(manga.tagCategories)) {
        tagIds = manga.tagCategories.map((t: any) => t.id);
      }
      
      // Parser les titres multilingues
      let parsedTitles = parseTitlesFromAPI(manga.titles);
      
      // Si pas de titres multilingues mais qu'il y a title/description, les utiliser comme fallback en anglais
      if (parsedTitles.length === 0 && (manga.title || manga.description)) {
        parsedTitles = [{
          i18_language: 'en',
          title: manga.title || '',
          description: manga.description || ''
        }];
      }
      
      setForm({
        ref: manga.ref || "",
        title: manga.title || "",
        description: manga.description || "",
        titles: parsedTitles, // Titres multilingues avec fallback
        mangas_category_id: manga.mangas_category_id ? String(manga.mangas_category_id) : "",
        mangas_sub_category_id: manga.mangas_sub_category_id ? String(manga.mangas_sub_category_id) : "",
        mangas_plateform_id: manga.mangas_plateform_id ? String(manga.mangas_plateform_id) : "",
        tagCategories: tagIds,
        creator: manga.creator || "",
        creator_id: manga.creator_id ? String(manga.creator_id) : "",
        total_chapters: manga.total_chapters ? String(manga.total_chapters) : "",
        need_vip: manga.need_vip || false,
        plateform_id: manga.plateform_id ? String(manga.plateform_id) : "",
        cover: null,
      });
    } catch (err: any) {
      toast.error("Erreur lors du chargement du manga");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox" && "checked" in e.target) {
      checked = (e.target as HTMLInputElement).checked;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((prev) => ({ ...prev, cover: e.target.files![0] }));
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
    } else {
      setFilteredTags([]);
    }
  };

  const addTag = (tag: any) => {
    // Vérifier si le tag n'est pas déjà ajouté
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
        } else if (key !== "cover") {
          formData.append(key, String(value));
        }
      });
      await updateManga(Number(mangaId), formData);
      toast.success("Manga modifié !");
      navigate("/mangas");
    } catch (err: any) {
      toast.error("Erreur lors de la modification du manga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Modifier le Manga</h1>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label className="block font-medium mb-1">Référence (ref)</label>
          <input name="ref" value={form.ref} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
        
        {/* Nouveau champ Titres multilingues */}
        <MangaTitlesField
          value={form.titles}
          onChange={(titles) => setForm({ ...form, titles })}
          label="Titres multilingues"
          required={false}
        />
        
        <div>
          <label className="block font-medium mb-1">Catégorie</label>
          <select name="mangas_category_id" value={form.mangas_category_id} onChange={handleChange} className="input input-bordered w-full" required>
            <option value="">Sélectionner</option>
            {Array.isArray(categories) && categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Sous-catégorie</label>
          <select name="mangas_sub_category_id" value={form.mangas_sub_category_id} onChange={handleChange} className="input input-bordered w-full">
            <option value="">Sélectionner</option>
            {Array.isArray(subCategories) && subCategories.map((sub: any) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Plateforme</label>
          <select name="plateform_id" value={form.plateform_id} onChange={handleChange} className="input input-bordered w-full" required>
            <option value="">Sélectionner</option>
            {plateforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Créateur</label>
          <div className="relative" ref={creatorDropdownRef}>
            <div className="input input-bordered w-full text-left flex items-center gap-3 focus-within:ring-2 focus-within:ring-primary transition-colors">
              {selectedCreator?.avatar ? (
                <img src={cdnS3(selectedCreator.avatar)} alt="Creator" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}

              <input
                type="text"
                value={creatorInput}
                onChange={handleCreatorInputChange}
                onFocus={() => setShowCreatorDropdown(true)}
                placeholder="Sélectionner ou rechercher un créateur..."
                className="flex-1 bg-transparent outline-none"
              />

              <div className="flex items-center gap-2">
                {form.creator_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, creator_id: "" }));
                      setCreatorInput("");
                      setShowCreatorDropdown(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Clear creator"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCreatorDropdown((s) => !s)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Toggle creators"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showCreatorDropdown ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showCreatorDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-base-100 border border-base-300 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                >
                  {/* Option vide */}
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, creator_id: "" }));
                      setCreatorInput("");
                      setShowCreatorDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-base-200 transition-colors duration-200 flex items-center gap-3 border-b border-base-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-base-content/50" />
                    </div>
                    <span className="text-base-content/50 text-sm">Aucun créateur</span>
                  </button>

                  {filteredCreators.map((creator: any, index) => (
                    <motion.button
                      key={creator.id}
                      type="button"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => selectCreator(creator)}
                      className={`w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors duration-200 flex items-center gap-3 group ${
                        form.creator_id === String(creator.id) ? "bg-primary/10" : ""
                      }`}
                    >
                      {creator.avatar ? (
                        <img
                          src={cdnS3(creator.avatar)}
                          alt={creator.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary transition-all duration-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary transition-all duration-200">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <span className="flex-1 text-sm font-medium">
                        {creator.name}
                      </span>
                      {form.creator_id === String(creator.id) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Total chapitres</label>
          <input name="total_chapters" value={form.total_chapters} onChange={handleChange} className="input input-bordered w-full" type="number" min="1" />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags</label>
          <div className="relative">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
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
                placeholder="Rechercher ou créer un tag..."
                className="input input-bordered flex-1"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="btn btn-secondary"
                disabled={!tagInput.trim()}
              >
                Ajouter
              </button>
            </div>
            
            {filteredTags.length > 0 && (
              <div className="absolute z-10 w-full bg-base-100 border border-base-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredTags.map((tag: any) => (
                  <div
                    key={tag.id}
                    onClick={() => addTag(tag)}
                    className="px-4 py-2 hover:bg-base-200 cursor-pointer"
                  >
                    {tag.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Tags sélectionnés */}
          <div className="flex flex-wrap gap-2 mt-3">
            {form.tagCategories.map((tag, index) => (
              <div
                key={index}
                className="badge badge-primary gap-2 px-3 py-3"
              >
                <span>{getTagDisplay(tag)}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">VIP</label>
          <input name="need_vip" type="checkbox" checked={form.need_vip} onChange={handleChange} className="checkbox" />
        </div>
        <div>
          <label className="block font-medium mb-1">Image de couverture (laisser vide pour conserver)</label>
          <input name="cover" type="file" accept="image/*" onChange={handleFileChange} className="file-input file-input-bordered w-full" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Modification..." : "Enregistrer"}</button>
      </form>
    </div>
  );
};

export default EditMangasPage;
