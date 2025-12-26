import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAudioAlbumApi } from "../api/audioAlbum";
import { getAudiosListApi } from "../api/audios";
import { AudioTitlesField } from "../components/AudioTitlesField";
import toast from "react-hot-toast";

const initialForm = {
  ref: "",
  album_number: "",
  total_tracks: "",
  release_date: "",
  audio_id: "",
  user_id: "",
  metadata: "",
  isDeleted: false,
  titles: [], // multilingual titles/descriptions
};

const UploadAudioAlbum: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [audios, setAudios] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [titles, setTitles] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const audioId = searchParams.get("audio_id");
    if (audioId) setForm((prev) => ({ ...prev, audio_id: audioId }));
    // If user_id is available in context, set it here
  }, [searchParams]);

  useEffect(() => {
    getAudiosListApi().then((res) => setAudios(res.data || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as any).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTitlesChange = (newTitles: any[]) => {
    setTitles(newTitles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData: any = {};
      Object.entries(form).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          formData[key] = value ? "true" : "false";
        } else if (value) {
          formData[key] = value;
        }
      });
      // Add multilingual titles/descriptions as JSON in metadata
      if (titles && titles.length > 0) {
        formData.metadata = JSON.stringify({ ...form.metadata ? JSON.parse(form.metadata) : {}, titles });
      }
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
    <div className="max-w-xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-black mb-8 text-indigo-700 dark:text-indigo-400">Créer un AudioAlbum</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Audio</label>
          <select name="audio_id" value={form.audio_id} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500">
            <option value="">Sélectionner un audio</option>
            {audios.map((a) => (
              <option key={a.id} value={a.id}>{a.ref || a.id}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Référence</label>
          <input name="ref" value={form.ref} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Numéro d'album</label>
            <input name="album_number" value={form.album_number} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex-1">
            <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Nombre de pistes</label>
            <input name="total_tracks" min={1} value={form.total_tracks} onChange={handleChange} type="number" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">Date de sortie</label>
          <input name="release_date" value={form.release_date} onChange={handleChange} type="date" className="w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-indigo-500" />
        </div>
        <AudioTitlesField value={titles} onChange={handleTitlesChange} label="Titres multilingues (i18n)" />
        <button type="submit" disabled={saving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
          {saving ? "Création..." : "Créer l'album"}
        </button>
      </form>
    </div>
  );
};

export default UploadAudioAlbum;
