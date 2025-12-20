import React, { useEffect, useState } from "react";
import { getMangasChaptersApi, createMangasChapterApi } from "../api/mangasChapter";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

interface Chapter {
  id: number;
  title: string;
  description?: string;
  chapter_number: number;
  metadata?: any;
}

interface Props {
  mangaId: number;
}

const MangasChaptersPage: React.FC<Props> = ({ mangaId }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    chapter_number: "",
    metadata: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchChapters();
    // eslint-disable-next-line
  }, [mangaId]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await getMangasChaptersApi(mangaId);
      setChapters(res.data?.data || res.data || []);
    } catch {
      setChapters([]);
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
    setCreating(true);
    try {
      await createMangasChapterApi(mangaId, {
        title: form.title,
        description: form.description,
        chapter_number: form.chapter_number ? Number(form.chapter_number) : undefined,
        metadata: form.metadata ? JSON.parse(form.metadata) : undefined,
      });
      toast.success("Chapitre créé !");
      setForm({ title: "", description: "", chapter_number: "", metadata: "" });
      fetchChapters();
    } catch (err: any) {
      toast.error("Erreur lors de la création du chapitre");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chapitres</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input name="title" value={form.title} onChange={handleChange} className="input input-bordered w-full" placeholder="Titre du chapitre" required />
        <textarea name="description" value={form.description} onChange={handleChange} className="input input-bordered w-full" placeholder="Description" />
        <input name="chapter_number" value={form.chapter_number} onChange={handleChange} className="input input-bordered w-full" placeholder="Numéro du chapitre (optionnel)" type="number" min="1" />
        <input name="metadata" value={form.metadata} onChange={handleChange} className="input input-bordered w-full" placeholder="Metadata (JSON optionnel)" />
        <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? "Création..." : "Créer le chapitre"}</button>
      </form>
      <div className="overflow-x-auto rounded shadow border">
        <table className="min-w-full bg-white dark:bg-gray-900">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">#</th>
              <th className="px-4 py-2 border-b">Titre</th>
              <th className="px-4 py-2 border-b">Description</th>
              <th className="px-4 py-2 border-b">Numéro</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Chargement...</td></tr>
            ) : chapters.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">Aucun chapitre.</td></tr>
            ) : (
              chapters.map((ch, idx) => (
                <tr key={ch.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 border-b">{idx + 1}</td>
                  <td className="px-4 py-2 border-b font-semibold">{ch.title}</td>
                  <td className="px-4 py-2 border-b">{ch.description || '-'}</td>
                  <td className="px-4 py-2 border-b text-center">{ch.chapter_number}</td>
                  <td className="px-4 py-2 border-b text-center">
                    <Link
                      to={`/mangas/${mangaId}/chapters/${ch.id}/edit`}
                      className="btn btn-xs btn-outline"
                    >
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MangasChaptersPage;
