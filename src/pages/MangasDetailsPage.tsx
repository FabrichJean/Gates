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
  Send,
  Loader2
} from "lucide-react";
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { getMangaById, updateManga, uploadMangaToS3, toggleMangaBannedStatus, updateMangaBannedStatus } from "../api/mangas";
import toast from "react-hot-toast";
import MangaChecking from "../components/MangaChecking";
import { MangaTitlesViewer } from "../components/MangaTitlesViewer";
import { parseTitlesFromAPI } from "../utils/mangaTitlesUtils";
import { forceResetMangaUpload } from "../hooks/useMangaUploadSocket";
import { useContextMangaUpload } from "../context/MangaUploadSocketContext";
import { MangaUploadProgress } from "../components/MangaUploadProgress";

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
  isBanned: boolean;
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

  // Use context-based upload hook with callbacks
  const { isUploading, progress, currentTask } = useContextMangaUpload(
    Number(mangaId),
    {
      onProgress: (data) => {
        console.log("Upload progress:", data);
      },
      onComplete: (data) => {
        toast.success(data.message || "Upload completed!");
        fetchManga(); // Refresh manga data
      },
      onError: (data) => {
        toast.error(data.error || "Upload failed");
      }
    }
  );

  useEffect(() => {
    if (mangaId) fetchManga();
  }, [mangaId]);

  const fetchManga = async () => {
    setLoading(true);
    try {
      const res = await getMangaById(Number(mangaId));
      const mangaData = res.data || res;
      setManga(mangaData);
      
      // If manga is not in "working" state but we have upload progress, clear it
      if (mangaData.processing !== "working" && mangaId) {
        forceResetMangaUpload(Number(mangaId));
      }
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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* Header avec boutons uniquement */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Bouton retour */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
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
                disabled={
                  manga.processing === "done" || 
                  manga.checking !== "checked" || 
                  isUploading || 
                  manga.processing === "working"
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                  manga.processing === "done" || 
                  manga.checking !== "checked" || 
                  isUploading || 
                  manga.processing === "working"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-200 dark:border-gray-700"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow border border-emerald-600"
                }`}
                title={
                  manga.processing === "done" 
                    ? "Already uploaded" 
                    : manga.checking !== "checked"
                    ? "Manga must be checked first"
                    : isUploading || manga.processing === "working"
                    ? "Upload in progress..."
                    : "Upload to S3"
                }
              >
                {isUploading || manga.processing === "working" ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading... {progress > 0 && `${Math.round(progress)}%`}
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    {manga.processing === "done" ? "Uploaded" : "Upload"}
                  </>
                )}
              </button>
              
              {/* Toggle Active/Inactive */}
              <button
                onClick={handleToggleDeleted}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 border ${
                  manga.isDeleted
                    ? 'bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                title={manga.isDeleted ? 'Activate manga' : 'Deactivate manga'}
              >
                {manga.isDeleted ? 'Activate' : 'Deactivate'}
              </button>

              {/* Toggle Banned/Unbanned */}
              <button
                onClick={async () => {
                  const should = window.confirm(
                    manga.isBanned ? "Are you sure you want to unban this manga?" : "Are you sure you want to ban this manga?"
                  );
                  if (!should) return;
                  try {
                    await updateMangaBannedStatus(manga.id, !manga.isBanned);
                    toast.success(`Manga ${!manga.isBanned ? 'banned' : 'unbanned'} successfully`);
                    fetchManga();
                  } catch (error: any) {
                    toast.error(error?.response?.data?.message || 'Failed to update banned status');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 border ${
                  manga.isBanned
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                    : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                }`}
                title={manga.isBanned ? 'Unban manga' : 'Ban manga'}
              >
                {manga.isBanned ? 'Unban' : 'Ban'}
              </button>
              <Link
                to={`/mangas/${manga.id}/chapters`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all duration-200 shadow-sm hover:shadow border border-blue-600"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Chapters
              </Link>
              <Link
                to={`/mangas/${manga.id}/edit`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all duration-200 shadow-sm hover:shadow border border-blue-600"
              >
                <Edit className="w-3.5 h-3.5" />
                Modifier
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Upload Progress Bar */}
        <MangaUploadProgress mangaId={Number(mangaId)} variant="full" className="mb-4" />

        {/* Section Titres Multilingues - Espace dédié */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <MangaTitlesViewer
            titles={parseTitlesFromAPI(manga?.titles)}
            showDescription={true}
            titleAs="h1"
            titleClassName="text-3xl font-bold text-gray-900 dark:text-gray-100"
            descriptionAs="p"
            descriptionClassName="text-sm text-gray-600 dark:text-gray-400 mt-1.5 max-w-full"
          />
        </motion.div>

        {/* Informations et statuts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-6 flex-wrap"
        >
          {/* Checking Status */}
          <MangaChecking
            manga={manga}
            index={0}
            reFetch={fetchManga}
          />
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {manga.total_chapters || 0} chapitres
            </span>
          </div>
          
          {manga.isDeleted !== undefined && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
              manga.isDeleted 
                ? 'bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${manga.isDeleted ? 'bg-gray-400' : 'bg-emerald-500'}`} />
              {manga.isDeleted ? 'Inactive' : 'Active'}
            </span>
          )}
          
          {manga.need_vip && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800 text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              VIP
            </span>
          )}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cover Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className={`aspect-[3/4] relative group ${manga.isBanned ? "ring-4 ring-red-500 ring-opacity-50" : ""}`}>
                    {manga.isBanned && (
                      <div className="absolute inset-0 z-30 flex items-start justify-end p-3 pointer-events-none">
                        <div className="flex gap-2 pointer-events-auto">
                          <button
                            onClick={() => {
                              const next = !Boolean(localStorage.getItem(`manga-show-cover-${manga.id}`) === 'true');
                              localStorage.setItem(`manga-show-cover-${manga.id}`, String(next));
                              // force rerender
                              window.location.reload();
                            }}
                            className="bg-black/40 text-white p-2 rounded-md hover:bg-black/60 transition"
                            title="Toggle cover visibility"
                          >
                            { (localStorage.getItem(`manga-show-cover-${manga.id}`) === 'true') ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" /> }
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Remove cover from server? This action may be irreversible.')) return;
                              try {
                                const form = new FormData();
                                form.append('remove_cover', '1');
                                await updateManga(manga.id, form as any);
                                toast.success('Cover removed');
                                // refetch by reloading page or calling fetchManga
                                window.location.reload();
                              } catch (err: any) {
                                toast.error(err?.response?.data?.message || 'Failed to remove cover');
                              }
                            }}
                            className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition"
                            title="Remove cover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    { (manga.isBanned && localStorage.getItem(`manga-show-cover-${manga.id}`) !== 'true') ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-600" />
                      </div>
                    ) : (
                      (manga.cover_url ? (
                        <motion.img
                          src={manga.s3_cover_url || manga.cover_url}
                          alt={manga.ref}
                          className={`w-full h-full object-cover ${manga.isBanned ? 'filter blur-sm brightness-75' : ''}`}
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                        </div>
                      ))
                    )}
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
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Informations générales
                </h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-base">
                      #{manga.id}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Référence</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {manga.ref}
                    </p>
                  </div>

                  {manga.title && (
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Titre</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                        {manga.title}
                      </p>
                    </div>
                  )}

                  {manga.description && (
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {manga.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total des chapitres</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                      {manga.total_chapters || 0}
                    </p>
                  </div>

                  {manga.mangasCategory && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Catégorie</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                        {manga.mangasCategory.name}
                      </span>
                    </div>
                  )}

                  {manga.mangasSubCategory && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sous-catégorie</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium">
                        {manga.mangasSubCategory.name}
                      </span>
                    </div>
                  )}

                  {manga.plateform && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Plateforme</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium">
                        {manga.plateform.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Creator */}
                {manga.creatorObj && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Créateur
                    </p>
                    <div className="flex items-center gap-3">
                      {manga.creatorObj.avatar && (
                        <motion.img
                          src={manga.creatorObj.avatar}
                          alt={manga.creatorObj.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                          whileHover={{ scale: 1.05 }}
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
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
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags
                  </h2>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    <AnimatePresence>
                      {manga.tagCategories.map((tag, index) => (
                        <motion.span
                          key={tag.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-700"
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
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Chapitres récents
                  </h2>
                  
                  <Link
                    to={`/mangas/${manga.id}/chapters`}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Voir tout
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2">
                    <AnimatePresence>
                      {manga.chapters.map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                {chapter.chapter_number}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                  {chapter.title}
                                </h3>
                                {chapter.description && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {chapter.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to={`/mangas/${manga.id}/chapters/${chapter.id}/edit`}
                            className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Métadonnées
                </h2>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manga.createdAt && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Créé le
                      </p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
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
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Modifié le
                      </p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
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