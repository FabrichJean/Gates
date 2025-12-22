import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Image as ImageIcon,
  Save,
  Loader2,
  X,
  Upload,
  FileText,
  Hash,
  ArrowLeft
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { createMangasEpisodeApi } from "../api/mangasEpisode";
import toast from "react-hot-toast";
import type { MangaTitles } from "../types/mangaTitles";
import { prepareTitlesForAPI } from "../utils/mangaTitlesUtils";
import { MangaTitlesField } from "../components/MangaTitlesField";

const UploadMangasEpisodePage: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    number: "",
    description: "",
    titles: [] as MangaTitles, // Titres multilingues
    metadata: "",
    images: [] as File[],
  });
  const [loading, setLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Nettoyer les URLs d'aperçu à la désinstallation
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setForm((prev) => ({ ...prev, images: files }));
      
      // Créer des aperçus
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setForm((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
    
    // Libérer la mémoire
    URL.revokeObjectURL(imagePreviews[index]);
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
      
      // Ajouter les titres multilingues s'ils existent
      if (form.titles.length > 0) {
        formData.append("titles", prepareTitlesForAPI(form.titles));
      }
      
      form.images.forEach((file) => {
        formData.append("images", file);
      });

      await createMangasEpisodeApi(Number(chapterId), formData);
      toast.success("Épisode créé avec succès!");
      
      // Nettoyer avant de naviguer
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setForm({
        name: "",
        number: "",
        description: "",
        titles: [],
        metadata: "",
        images: [],
      });
      
      navigate(`/mangas/${mangaId}/chapters`);
    } catch (err: any) {
      toast.error("Erreur lors de la création de l'épisode");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/mangas/${mangaId}/chapters/${chapterId}/episodes`);
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
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 dark:text-gray-100"
              >
                Créer un épisode
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Ajoutez un nouvel épisode à votre chapitre
              </p>
            </div>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Nom de l'épisode
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                placeholder="Entrez le nom de l'épisode"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Numéro de l'épisode
              </label>
              <input
                name="number"
                value={form.number}
                onChange={handleChange}
                type="number"
                min="1"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                placeholder="Numéro de l'épisode"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 resize-none"
              placeholder="Décrivez l'épisode"
              rows={4}
            />
          </div>

          {/* Titres multilingues */}
          <div>
            <MangaTitlesField
              value={form.titles}
              onChange={(titles) => setForm({ ...form, titles })}
              label="Titres multilingues (optionnel)"
              required={false}
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Images de l'épisode
            </label>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Cliquez pour télécharger des images ou glissez-les ici
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  PNG, JPG, WEBP (max 10MB par image)
                </p>
              </div>
            </div>

            {/* Image Previews */}
            <AnimatePresence>
              {form.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {form.images.length} image(s) sélectionnée(s)
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {form.images.map((file, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group"
                      >
                        <img
                          src={imagePreviews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg shadow-md"
                        />
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <X className="w-3 h-3" />
                        </motion.button>
                        
                        <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-1">
                          <p className="text-xs text-white truncate">{file.name}</p>
                          <p className="text-xs text-gray-300">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                Créer l'épisode
              </>
            )}
          </motion.button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default UploadMangasEpisodePage;