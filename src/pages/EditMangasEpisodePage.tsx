import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMangasEpisodeByIdApi, updateMangasEpisodeApi, deleteEpisodeImagesApi, addEpisodeImagesApi } from "../api/mangasEpisode";
import toast from "react-hot-toast";
import { parseTitlesFromAPI, prepareTitlesForAPI } from "../utils/mangaTitlesUtils";
import type { MangaTitles } from "../types/mangaTitles";
import { MangaTitlesField } from "../components/MangaTitlesField";

interface EpisodeImage {
  id: number;
  image_url: string;
}

interface Episode {
  id: number;
  name: string;
  number: number;
  description?: string;
  titles?: string;
  images?: EpisodeImage[];
  images_url?: string[];
  metadata?: any;
}

const EditMangasEpisodePage: React.FC = () => {
  const { mangaId, chapterId, episodeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [form, setForm] = useState({
    name: "",
    number: "",
    description: "",
    metadata: "",
    titles: [] as MangaTitles,
  });
  const [existingImages, setExistingImages] = useState<EpisodeImage[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imageIdsToDelete, setImageIdsToDelete] = useState<number[]>([]);

  useEffect(() => {
    if (episodeId) fetchEpisode();
    // eslint-disable-next-line
  }, [episodeId]);

  const fetchEpisode = async () => {
    setLoading(true);
    try {
      const res = await getMangasEpisodeByIdApi(Number(episodeId));
      const data = res.data?.data || res.data;
      setEpisode(data);
      setForm({
        name: data.name || "",
        number: String(data.number || ""),
        description: data.description || "",
        metadata: data.metadata ? JSON.stringify(data.metadata, null, 2) : "",
        titles: data.titles ? parseTitlesFromAPI(data.titles) : [],
      });
      // Si l'API retourne un tableau d'objets avec id et image_url
      if (data.mangasImages && Array.isArray(data.mangasImages)) {
        setExistingImages(data.mangasImages);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement de l'épisode");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  const handleMarkImageForDeletion = (imageId: number) => {
    // Ajouter/retirer l'image de la liste à supprimer
    setImageIdsToDelete((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId);
      }
      return [...prev, imageId];
    });
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Supprimer les images marquées pour suppression
      if (imageIdsToDelete.length > 0) {
        try {
          await deleteEpisodeImagesApi(Number(episodeId), imageIdsToDelete);
          toast.success(`${imageIdsToDelete.length} image(s) supprimée(s)`);
        } catch (error) {
          toast.error("Erreur lors de la suppression des images");
          setLoading(false);
          return;
        }
      }

      // 2. Ajouter de nouvelles images
      if (newImages.length > 0) {
        try {
          const imagesFormData = new FormData();
          newImages.forEach((file) => {
            imagesFormData.append("images", file);
          });
          await addEpisodeImagesApi(Number(episodeId), imagesFormData);
          toast.success(`${newImages.length} image(s) ajoutée(s)`);
        } catch (error) {
          toast.error("Erreur lors de l'ajout des images");
          setLoading(false);
          return;
        }
      }

      // 3. Mettre à jour les informations de l'épisode (sans images)
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("number", form.number);
      formData.append("description", form.description);
      
      // Ajouter les titres multilingues
      if (form.titles.length > 0) {
        formData.append("titles", prepareTitlesForAPI(form.titles));
      }
      
      if (form.metadata.trim()) {
        try {
          const metadataObj = JSON.parse(form.metadata);
          formData.append("metadata", JSON.stringify(metadataObj));
        } catch {
          toast.error("Le metadata doit être un JSON valide");
          setLoading(false);
          return;
        }
      }

      await updateMangasEpisodeApi(Number(episodeId), Number(chapterId), formData);
      toast.success("Épisode mis à jour avec succès");
      navigate(`/mangas/${mangaId}/chapters/${chapterId}/episodes/${episodeId}`);
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour de l'épisode");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !episode) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Éditer l'épisode</h1>
        <Link
          to={`/mangas/${mangaId}/chapters/${chapterId}/episodes/${episodeId}`}
          className="btn btn-ghost"
        >
          ← Retour
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Nom de l'épisode</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              required
            />
            </div>

          <div>
            <label className="block font-medium mb-1 text-gray-900 dark:text-gray-100">Numéro</label>
            <input
              type="number"
              name="number"
              value={form.number}
              onChange={handleChange}
              className="input input-bordered w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
              min="1"
              required
            />
          </div>
        </div>

        {/* Titres multilingues */}
        <div>
          <MangaTitlesField
            value={form.titles}
            onChange={(titles) => setForm((prev) => ({ ...prev, titles }))}
            label="Titres et descriptions multilingues (optionnel)"
          />
        </div>

        {/* Images existantes */}
        {existingImages.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">
              Images existantes 
              {imageIdsToDelete.length > 0 && (
                <span className="text-sm text-error ml-2">
                  ({imageIdsToDelete.length} marquée(s) pour suppression)
                </span>
              )}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {existingImages.map((image, index) => {
                const isMarkedForDeletion = imageIdsToDelete.includes(image.id);
                return (
                  <div 
                    key={image.id} 
                    className={`relative group ${isMarkedForDeletion ? 'opacity-50' : ''}`}
                  >
                    <img
                      src={image.image_url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleMarkImageForDeletion(image.id)}
                      className={`absolute top-2 right-2 btn btn-circle btn-sm opacity-0 group-hover:opacity-100 transition-opacity ${
                        isMarkedForDeletion ? 'btn-warning' : 'btn-error'
                      }`}
                      title={isMarkedForDeletion ? "Annuler la suppression" : "Marquer pour suppression"}
                    >
                      {isMarkedForDeletion ? "↶" : "✕"}
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                      Page {index + 1}
                      {isMarkedForDeletion && <span className="ml-1">🗑️</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nouvelles images à ajouter */}
        <div>
          <label className="block font-medium mb-1">Ajouter de nouvelles images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImagesChange}
            className="file-input file-input-bordered w-full"
          />
          {newImages.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Nouvelles images ({newImages.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-40 object-cover rounded-lg shadow"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 btn btn-circle btn-error btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Retirer cette image"
                    >
                      ✕
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs truncate max-w-[90%]">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Mise à jour...
              </>
            ) : (
              "Mettre à jour"
            )}
          </button>
          <Link
            to={`/mangas/${mangaId}/chapters/${chapterId}/episodes/${episodeId}`}
            className="btn btn-ghost"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditMangasEpisodePage;
