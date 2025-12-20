import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createMangasEpisodeApi } from "../api/mangasEpisode";
import toast from "react-hot-toast";

const UploadMangasEpisodePage: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    number: "",
    description: "",
    metadata: "",
    images: [] as File[],
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterId) {
      toast.error("Chapter ID manquant");
      return;
    }
    if (form.images.length === 0) {
      toast.error("Veuillez sélectionner au moins une image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("number", form.number);
      formData.append("description", form.description);
      if (form.metadata) formData.append("metadata", form.metadata);
      form.images.forEach((file) => {
        formData.append("images", file);
      });

      await createMangasEpisodeApi(Number(chapterId), formData);
      toast.success("Épisode créé !");
      navigate(`/mangas/${mangaId}/chapters`);
    } catch (err: any) {
      toast.error("Erreur lors de la création de l'épisode");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Créer un épisode</h2>
      <form onSubmit={handleSubmit} className="space-y-3" encType="multipart/form-data">
        <div>
          <label className="block font-medium mb-1">Nom</label>
          <input name="name" value={form.name} onChange={handleChange} className="input input-bordered w-full" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Numéro</label>
          <input name="number" value={form.number} onChange={handleChange} className="input input-bordered w-full" type="number" min="1" required />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="textarea textarea-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Metadata (JSON optionnel)</label>
          <input name="metadata" value={form.metadata} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-medium mb-1">Images (requis)</label>
          <input name="images" type="file" accept="image/*" multiple onChange={handleFileChange} className="file-input file-input-bordered w-full" required />
          {form.images.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {form.images.length} image(s) sélectionnée(s)
            </p>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Création..." : "Créer l'épisode"}
        </button>
      </form>
    </div>
  );
};

export default UploadMangasEpisodePage;
