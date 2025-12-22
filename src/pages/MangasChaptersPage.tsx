import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  BookOpen, 
  Edit, 
  FileText,
  Hash,
  ChevronRight,
  Calendar,
  Clock,
  Trash2,
  Save,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMangasChaptersApi, createMangasChapterApi } from "../api/mangasChapter";
import toast from "react-hot-toast";
import type { MangaTitles } from "../types/mangaTitles";
import { prepareTitlesForAPI } from "../utils/mangaTitlesUtils";
import { MangaTitlesField } from "../components/MangaTitlesField";

interface Chapter {
  id: number;
  title: string;
  description?: string;
  chapter_number: number;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

const MangasChaptersPage: React.FC = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    titles: [] as MangaTitles, // Titres multilingues
    chapter_number: "",
    metadata: "",
  });

  useEffect(() => {
    fetchChapters();
  }, [mangaId]);

  const fetchChapters = async () => {
    if (!mangaId) return;
    
    setLoading(true);
    try {
      const res = await getMangasChaptersApi(Number(mangaId));
      const data = res.data?.data || res.data || [];
      setChapters(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Erreur lors du chargement des chapitres");
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
    if (!mangaId) return;

    setCreating(true);
    try {
      const chapterData: any = {
        title: form.title,
        description: form.description,
        chapter_number: form.chapter_number ? Number(form.chapter_number) : undefined,
        metadata: form.metadata ? JSON.parse(form.metadata) : undefined,
      };

      // Ajouter les titres multilingues s'ils existent
      if (form.titles.length > 0) {
        chapterData.titles = prepareTitlesForAPI(form.titles);
      }

      await createMangasChapterApi(Number(mangaId), chapterData);
      
      toast.success("Chapitre créé avec succès!");
      setForm({ 
        title: "", 
        description: "", 
        titles: [], 
        chapter_number: "", 
        metadata: "" 
      });
      setShowForm(false);
      fetchChapters();
      
    } catch (err: any) {
      toast.error("Erreur lors de la création du chapitre");
    } finally {
      setCreating(false);
    }
  };

  const handleGoBack = () => {
    navigate(`/mangas/${mangaId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
                Gestion des Chapitres
              </motion.h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez les chapitres de votre manga
              </p>
            </div>
          </div>

          {/* Create Chapter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Créer un chapitre
          </motion.button>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 mb-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Nouveau chapitre
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Numéro du chapitre
                      </label>
                      <input
                        name="chapter_number"
                        value={form.chapter_number}
                        onChange={handleChange}
                        type="number"
                        min="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300"
                        placeholder="Numéro du chapitre"
                      />
                    </div>
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

                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-200"
                    >
                      Annuler
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={creating}
                      className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                        creating
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Créer le chapitre
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chapters List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Liste des chapitres
              </h2>
            </div>

            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Chargement des chapitres...</p>
                </div>
              </div>
            ) : chapters.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucun chapitre</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Commencez par créer votre premier chapitre.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Créer un chapitre
                </motion.button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                <AnimatePresence>
                  {chapters.map((chapter, index) => (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              {chapter.chapter_number || index + 1}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {chapter.title}
                            </h3>
                          </div>
                          
                          {chapter.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {chapter.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            {chapter.createdAt && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(chapter.createdAt)}</span>
                              </div>
                            )}
                            
                            <Link
                              to={`/mangas/${mangaId}/chapters/${chapter.id}/episodes`}
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>Voir les épisodes</span>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/mangas/${mangaId}/chapters/${chapter.id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MangasChaptersPage;