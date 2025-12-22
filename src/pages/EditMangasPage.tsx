import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    getCreators().then((res) => setCreators(res.data || res)).catch(() => {});
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
          <select name="creator_id" value={form.creator_id} onChange={handleChange} className="input input-bordered w-full">
            <option value="">Sélectionner</option>
            {creators.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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
