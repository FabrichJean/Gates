import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAudioAlbumApi } from "../api/audioAlbum";
import { getAudiosListApi } from "../api/audios";
import { getAudioCategoriesApi } from "../api/audioCategory";
import { getAudioSubCategoriesApi } from "../api/audioSubCategory";
import { getAllPlateformsApi } from "../api/plateforms";
import { AudioTitlesField } from "../components/AudioTitlesField";
import toast from "react-hot-toast";

const initialForm = {
  ref: "",
  album_number: "",
  total_tracks: "",
  release_date: "",
  audio_id: "",
  audio_category_id: "",
  audio_sub_category_id: "",
  plateform_id: "",
  metadata: "",
  cover: null as File | null,
  titles: [],
};

const UploadAudioAlbum: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [audios, setAudios] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [plateforms, setPlateforms] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pré-remplir audio_id si présent dans l'URL
  useEffect(() => {
    const audioId = searchParams.get("audio_id");
    if (audioId) setForm((prev) => ({ ...prev, audio_id: audioId }));
  }, [searchParams]);

  useEffect(() => {
    getAudiosListApi().then((res) => setAudios(res.data || []));
    getAudioCategoriesApi().then((res) => setCategories(res.data || []));
    getAllPlateformsApi().then((res) => setPlateforms(res.data?.items || res.data || []));
  }, []);

  useEffect(() => {
    if (form.audio_category_id) {
      getAudioSubCategoriesApi(parseInt(form.audio_category_id))
        .then((res) => {
          const subs = res.data || res;
          setSubCategories(Array.isArray(subs) ? subs : []);
        })
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
      setForm((prev) => ({ ...prev, audio_sub_category_id: "" }));
    }
  }, [form.audio_category_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "file" ? (e.target as any).files[0] : value }));
  };

  const handleTitlesChange = (titles: any) => {
    setForm((prev) => ({ ...prev, titles }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "cover" && value) formData.append("cover", value as File);
        else if (key === "titles" && value && Array.isArray(value) && value.length > 0) formData.append("titles", JSON.stringify(value));
        else if (value && typeof value !== "object") formData.append(key, value);
      });
      await createAudioAlbumApi(formData);
      toast.success("Album créé avec succès !");
      navigate("/audio-albums");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Créer un AudioAlbum</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Audio</label>
          <select name="audio_id" value={form.audio_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border">
            <option value="">Sélectionner un audio</option>
            {audios.map((a) => (
              <option key={a.id} value={a.id}>{a.ref || a.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Référence</label>
          <input name="ref" value={form.ref} onChange={handleChange} className="w-full px-3 py-2 rounded border" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Numéro d'album</label>
            <input name="album_number" value={form.album_number} onChange={handleChange} type="number" className="w-full px-3 py-2 rounded border" />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Nombre de pistes</label>
            <input name="total_tracks" value={form.total_tracks} onChange={handleChange} type="number" className="w-full px-3 py-2 rounded border" />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Date de sortie</label>
          <input name="release_date" value={form.release_date} onChange={handleChange} type="date" className="w-full px-3 py-2 rounded border" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Catégorie</label>
            <select name="audio_category_id" value={form.audio_category_id} onChange={handleChange} className="w-full px-3 py-2 rounded border">
              <option value="">Sélectionner</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Sous-catégorie</label>
            <select name="audio_sub_category_id" value={form.audio_sub_category_id} onChange={handleChange} className="w-full px-3 py-2 rounded border">
              <option value="">Sélectionner</option>
              {subCategories.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Plateforme</label>
          <select name="plateform_id" value={form.plateform_id} onChange={handleChange} required className="w-full px-3 py-2 rounded border">
            <option value="">Sélectionner</option>
            {plateforms.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Méta-données (JSON)</label>
          <textarea name="metadata" value={form.metadata} onChange={handleChange} className="w-full px-3 py-2 rounded border" rows={2} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Image de couverture</label>
          <input name="cover" type="file" accept="image/*" onChange={handleChange} className="w-full" />
        </div>
        <AudioTitlesField value={form.titles} onChange={handleTitlesChange} label="Titres multilingues" />
        <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
          {saving ? "Création..." : "Créer l'album"}
        </button>
      </form>
    </div>
  );
};

export default UploadAudioAlbum;
