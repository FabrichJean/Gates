import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Tag, 
  User, 
  Calendar,
  Clock,
  Image as ImageIcon,
  Info,
  ChevronRight,
  Star,
  Send
} from "lucide-react";
import { getMangaById, updateManga, uploadMangaToS3 } from "../api/mangas";
import toast from "react-hot-toast";
import MangaChecking from "../components/MangaChecking";
import { MangaTitlesViewer } from "../components/MangaTitlesViewer";
import { parseTitlesFromAPI } from "../utils/mangaTitlesUtils";
import type { MangaTitles } from "../types/mangaTitles";

interface Manga {
  s3_cover_url: string;
  id: number;
  ref: string;
  title?: string;
  description?: string;
  titles?: string; // JSON string of multilingual titles
  cover?: string;
  cover_url?: string;
  creator?: string;
  creator_id?: number;
  total_chapters?: number;
  need_vip?: boolean;
  isDeleted?: boolean;
  checking?: string;
  comment?: string;
  processing?: string;
  mangas_category_id?: number;
  mangas_sub_category_id?: number;
  plateform_id?: number;
  createdAt?: string;
  updatedAt?: string;
  mangasCategory?: { id: number; name: string };
  mangasSubCategory?: { id: number; name: string };
  plateform?: { id: number; name: string };
  creatorObj?: { id: number; name: string; avatar?: string };
  tagCategories?: Array<{
    id: number;
    name: string;
    meta?: any;
    MangasTag?: any;
  }>;
  chapters?: Array<{
    id: number;
    title: string;
    chapter_number: number;
    description?: string;
  }>;
}

const SexyLoader = () => (
  <div className="relative w-20 h-20 mx-auto">
    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 animate-pulse" />
    <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-white/80 animate-spin" />
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
        style={{
          top: '50%',
          left: '50%',
          transform: `rotate(${i * 120}deg) translateX(150%)`,
          animation: `orbit 1.5s linear infinite`,
          animationDelay: `${i * 0.2}s`,
        }}
      />
    ))}
  </div>
);

const MangasDetailsPage: React.FC = () => {
  const { mangaId } = useParams();
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mangaId) fetchManga();
  }, [mangaId]);

  const fetchManga = async () => {
    setLoading(true);
    try {
      const res = await getMangaById(Number(mangaId));
      setManga(res.data || res);
    } catch (error) {
      toast.error("Erreur lors du chargement du manga");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDeleted = async () => {
    if (!manga) return;
    try {
      const formData = new FormData();
      formData.append("isDeleted", String(!manga.isDeleted));
      
      await updateManga(manga.id, formData);
      toast.success(manga.isDeleted ? "Manga activé avec succès" : "Manga désactivé avec succès");
      fetchManga();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleSendManga = async () => {
    if (!manga) return;
    
    // Block upload if manga is not checked
    if (manga.checking !== "checked") {
      toast.error("Cannot upload: Manga must be checked and approved first", {
        duration: 4000,
        icon: "🚫",
      });
      return;
    }

    try {
      toast.loading("Envoi du manga vers S3/R2...", { id: "send-manga" });
      
      await uploadMangaToS3(manga.id);
      
      toast.success("Manga envoyé avec succès!", { id: "send-manga" });
      fetchManga();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'envoi du manga";
      toast.error(errorMessage, { id: "send-manga" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <SexyLoader />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du manga...</p>
        </motion.div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">Manga introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Le manga que vous recherchez n'existe pas.</p>
          <Link to="/mangas" className="btn btn-primary">
            Retour à la liste
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header avec boutons uniquement */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Bouton retour */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>

            {/* Boutons d'action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              {/* Send Button */}
              <button
                onClick={handleSendManga}
                disabled={manga.processing === "done" || manga.checking !== "checked"}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  manga.processing === "done" || manga.checking !== "checked"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow border border-emerald-600"
                }`}
                title={
                  manga.processing === "done" 
                    ? "Already uploaded" 
                    : manga.checking !== "checked"
                    ? "Manga must be checked first"
                    : "Upload to S3"
                }
              >
                <Send className="w-4 h-4" />
                {manga.processing === "done" ? "Uploaded" : "Upload"}
              </button>
              
              {/* Toggle Active/Inactive */}
              <button
                onClick={handleToggleDeleted}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 border ${
                  manga.isDeleted
                    ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                title={manga.isDeleted ? 'Activate manga' : 'Deactivate manga'}
              >
                {manga.isDeleted ? 'Activate' : 'Deactivate'}
              </button>

              <Link
                to={`/mangas/${manga.id}/edit`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all duration-200 shadow-sm hover:shadow border border-blue-600"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Section Titres Multilingues - Espace dédié */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <MangaTitlesViewer
            titles={parseTitlesFromAPI(manga?.titles)}
            showDescription={true}
            titleAs="h1"
            titleClassName="text-4xl font-bold text-gray-900 dark:text-gray-100"
            descriptionAs="p"
            descriptionClassName="text-gray-600 dark:text-gray-400 mt-2 max-w-full"
          />
        </motion.div>

        {/* Informations et statuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-8 flex-wrap"
        >
          {/* Checking Status */}
          <MangaChecking
            manga={manga}
            index={0}
            reFetch={fetchManga}
          />
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {manga.total_chapters || 0} chapitres
            </span>
          </div>
          
          {manga.isDeleted !== undefined && (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
              manga.isDeleted 
                ? 'bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${manga.isDeleted ? 'bg-gray-400' : 'bg-emerald-500'}`} />
              {manga.isDeleted ? 'Inactive' : 'Active'}
            </span>
          )}
          
          {manga.need_vip && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              VIP
            </span>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="aspect-[3/4] relative group">
                {manga.cover_url ? (
                  <motion.img
                    src={manga.s3_cover_url || manga.cover_url}
                    alt={manga.ref}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
                
                <motion.div
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/50 opacity-0 transition-opacity duration-300 flex items-center justify-center"
                >
                  <button className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-200">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* General Information */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Informations générales
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-lg">
                      #{manga.id}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Référence</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {manga.ref}
                    </p>
                  </div>

                  {manga.title && (
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Titre</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                        {manga.title}
                      </p>
                    </div>
                  )}

                  {manga.description && (
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {manga.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total des chapitres</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {manga.total_chapters || 0}
                    </p>
                  </div>

                  {manga.mangasCategory && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Catégorie</p>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-medium">
                        {manga.mangasCategory.name}
                      </span>
                    </div>
                  )}

                  {manga.mangasSubCategory && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Sous-catégorie</p>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm font-medium">
                        {manga.mangasSubCategory.name}
                      </span>
                    </div>
                  )}

                  {manga.plateform && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Plateforme</p>
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-sm font-medium">
                        {manga.plateform.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Creator */}
                {manga.creatorObj && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Créateur
                    </p>
                    <div className="flex items-center gap-4">
                      {manga.creatorObj.avatar && (
                        <motion.img
                          src={manga.creatorObj.avatar}
                          alt={manga.creatorObj.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                          whileHover={{ scale: 1.05 }}
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {manga.creatorObj.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {manga.tagCategories && manga.tagCategories.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </h2>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {manga.tagCategories.map((tag, index) => (
                        <motion.span
                          key={tag.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700"
                          title={tag?.meta ? JSON.stringify(tag.meta) : undefined}
                        >
                          #{tag.name}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Chapters */}
            {manga.chapters && manga.chapters.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Chapitres récents
                  </h2>
                  
                  <Link
                    to={`/mangas/${manga.id}/chapters`}
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Voir tout
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {manga.chapters.slice(0, 5).map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                {chapter.chapter_number}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {chapter.title}
                                </h3>
                                {chapter.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {chapter.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to={`/mangas/${manga.id}/chapters/${chapter.id}/edit`}
                            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Métadonnées
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {manga.createdAt && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Créé le
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(manga.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {manga.updatedAt && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Modifié le
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {new Date(manga.updatedAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MangasDetailsPage;