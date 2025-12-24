import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiURL, token } from "../constant";
import toast from "react-hot-toast";
import type { MangaTitles } from "../types/mangaTitles";
import { parseTitlesFromAPI, prepareTitlesForAPI } from "../utils/mangaTitlesUtils";
import { MangaTitlesField } from "../components/MangaTitlesField";

const EditMangasChapterPage: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    titles: [] as MangaTitles, // Titres multilingues
    chapter_number: "",
    metadata: "",
  });

  useEffect(() => {
    if (mangaId && chapterId) fetchChapter();
    // eslint-disable-next-line
  }, [mangaId, chapterId]);

  const fetchChapter = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiURL}/mangas-chapters/mangas/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const ch = res.data?.data || res.data;
      setForm({
        title: ch.title || "",
        description: ch.description || "",
        titles: ch.titles ? parseTitlesFromAPI(ch.titles) : [],
        chapter_number: ch.chapter_number ? String(ch.chapter_number) : "",
        metadata: ch.metadata ? JSON.stringify(ch.metadata) : "",
      });
    } catch {
      toast.error("Erreur lors du chargement du chapitre");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData: any = {
        title: form.title,
        description: form.description,
        chapter_number: form.chapter_number ? Number(form.chapter_number) : undefined,
        metadata: form.metadata ? JSON.parse(form.metadata) : undefined,
      };

      // Ajouter les titres multilingues s'ils existent
      if (form.titles.length > 0) {
        updateData.titles = prepareTitlesForAPI(form.titles);
      }

      await axios.put(
        `${apiURL}/mangas-chapters/mangas/chapters/${chapterId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token()}` } }
      );
      toast.success("Chapitre modifié !");
      navigate(-1);
    } catch {
      toast.error("Erreur lors de la modification du chapitre");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Modifier le chapitre</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        
        {/* Titres multilingues */}
        <div className="my-4">
          <MangaTitlesField
            value={form.titles}
            onChange={(titles) => setForm({ ...form, titles })}
            label="Titres multilingues (optionnel)"
            required={false}
          />
        </div>
        
        <label className="block mb-1 font-medium" htmlFor="chapter_number">
          Numéro du chapitre
        </label>
        <input
          id="chapter_number"
          name="chapter_number"
          value={form.chapter_number}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Numéro du chapitre"
          type="number"
          min="1"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Modification..." : "Enregistrer"}</button>
      </form>
    </div>
  );
};

export default EditMangasChapterPage;
