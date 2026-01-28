import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Eye, EyeOff, Shield, ShieldOff,
  ChevronLeft, ChevronRight, RefreshCw, Trash2,
  User, Calendar, Clock, Tag, Film, Image as ImageIcon,
  AlertTriangle, CheckCircle, Info, Edit
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useParams, useNavigate, Link } from "react-router-dom";
import { UsePostForApp, useNextPostForApp } from "../hooks/usePostForApp";
import PostForAppChecking from "../components/PostForApp/PostForAppChecking";
import GetImagePostForApp from "./posts-for-app/getImagePostForApp";
import GetVideoPostForApp from "./posts-for-app/getVideoPostForApp";
import GetPostForAppTitles from "./posts-for-app/GetPostForAppTitles";
import SingleSyncModal from "../components/SingleSyncModal";
import RoleEnum from "../utils/roleEnum";
import { togglePostForAppBannedStatus, updatePostForAppBannedStatus } from "../api/postsForApp";
import toast from "react-hot-toast";
import { singleSync } from "../api/videos";

// Types
interface PostForAppDetailsProps {}

// Composant de statut visuel
const StatusBadge: React.FC<{ status: boolean; label: string; icon?: React.ReactNode }> = ({ 
  status, 
  label, 
  icon 
}) => (
  <span className={`
    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
    ${status 
      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700' 
      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-700'
    }
  `}>
    {icon || (status ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />)}
    {label}
  </span>
);

// Composant d'info cliquable
const InfoItem: React.FC<{
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ label, value, icon, className = '' }) => (
  <div className={`group bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 ${className}`}>
    <div className="flex items-center gap-3 mb-2">
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-600 group-hover:shadow-md transition-shadow">
          <div className="text-gray-600 dark:text-gray-300">
            {icon}
          </div>
        </div>
      )}
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
      {value}
    </div>
  </div>
);

// Composant de navigation compact
const NavigationControls: React.FC<{
  hasPrev: boolean;
  hasNext: boolean;
  prevPost?: string;
  nextPost?: string;
  onNavigate: (direction: 'prev' | 'next') => void;
}> = ({ hasPrev, hasNext, prevPost, nextPost, onNavigate }) => (
  <div className="flex items-center gap-1">
    <button
      onClick={() => onNavigate('prev')}
      disabled={!hasPrev}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all
        ${hasPrev
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }
      `}
      title="Post précédent"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>

    <button
      onClick={() => onNavigate('next')}
      disabled={!hasNext}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition-all
        ${hasNext
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
        }
      `}
      title="Post suivant"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

// Composant d'overlay banni
const BannedOverlay: React.FC<{
  isBanned: boolean;
  showCover: boolean;
  onToggle: () => void;
  postTitle?: string;
}> = ({ isBanned, showCover, onToggle, postTitle }) => {
  if (!isBanned) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-md bg-black/50 z-20 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldOff className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Contenu Banni
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {postTitle || 'Ce post'} a été banni et n\'est plus visible publiquement.
          </p>
          <button
            onClick={onToggle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition mx-auto"
          >
            {showCover ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showCover ? 'Masquer le contenu' : 'Afficher le contenu'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Composant principal
const PostForAppDetails: React.FC<PostForAppDetailsProps> = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Ajout d'un paramètre refresh pour forcer le rechargement après édition
  const [refreshKey, setRefreshKey] = useState(0);
  const location = window.location;
  useEffect(() => {
    // Si l'URL contient ?refresh=, on force un refresh du composant
    if (location && location.search && location.search.includes('refresh=')) {
      setRefreshKey((k) => k + 1);
    }
  }, [location && location.search]);

  const { data: post, loading, error, reFetch } = UsePostForApp(id + (refreshKey ? `?refresh=${refreshKey}` : ''));

  const { nextPost, prevPost, hasNext, hasPrev } = useNextPostForApp(id);
  const [showCover, setShowCover] = useState<boolean>(true);
  const [singleSyncOpen, setSingleSyncOpen] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  // Gestion de l'affichage du cover depuis le localStorage
  useEffect(() => {
    if (post?.id) {
      const saved = localStorage.getItem(`post-show-cover-${post.id}`);
      setShowCover(saved !== 'false');
    }
  }, [post?.id]);

  const handleSingleSync = async (isForce: boolean) => {
    if (!post) return;
    setSingleSyncLoading(true);
    try {
      await singleSync({ entity: "post-for-app", origin_id: post.id, isForce });
      setSingleSyncOpen(false);
      reFetch();
      toast.success('Synchronisation réussie');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur de synchronisation');
    } finally {
      setSingleSyncLoading(false);
    }
  };

  const handleToggleBan = async () => {
    const should = window.confirm(
      post?.isBanned 
        ? "Êtes-vous sûr de vouloir débannir ce post ?" 
        : "Êtes-vous sûr de vouloir bannir ce post ?"
    );
    if (!should) return;
    
    try {
      await updatePostForAppBannedStatus(post!.id, !post!.isBanned);
      toast.success(`Post ${post?.isBanned ? 'débanni' : 'banni'} avec succès`);
      reFetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const targetId = direction === 'prev' ? prevPost.id : nextPost.id;
    if (targetId) {
      navigate(`/post-for-app/${targetId}`, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Post introuvable</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Le post demandé n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate('/post-for-app')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const postId = String(post.id).padStart(3, "0");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      {/* Header compact et professionnel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          {/* Ligne principale compacte */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Section gauche - Navigation et titre */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => navigate('/post-for-app')}
                className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Retour à la liste"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    POST-{postId}
                  </h1>
                  <StatusBadge
                    status={!post.isBanned}
                    label={post.isBanned ? "Banni" : "Actif"}
                    icon={post.isBanned ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {post.plateform.name} • {post.postCategory?.name}
                  {post.postSubCategory && ` • ${post.postSubCategory.name}`}
                </p>
              </div>
            </div>

            {/* Section droite - Creator + Actions */}
            <div className="flex items-center gap-4 flex-shrink-0 flex-wrap sm:flex-nowrap">
              {/* Creator feed style */}
              {post.creatorObj && (
                <Link
                  to={`/creators/${post.creatorObj.id}`}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition group min-w-0"
                  title={`Voir le profil de ${post.creatorObj.name}`}
                  style={{ maxWidth: 180 }}
                >
                  <img
                    src={post.creatorObj.avatar}
                    alt={post.creatorObj.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 group-hover:border-blue-400 flex-shrink-0"
                    onError={e => (e.currentTarget.style.display = 'none')}
                  />
                  <span className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[70px] sm:max-w-[120px]">
                    {post.creatorObj.name}
                  </span>
                  {post.creatorObj.verified && (
                    <span className="ml-1 inline-flex items-center text-blue-500 dark:text-blue-400" title="Vérifié">
                      <CheckCircle className="w-4 h-4" />
                    </span>
                  )}
                </Link>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible max-w-full sm:max-w-none">
                {/* Vérification - seulement si il y a des vidéos */}
                {post.videos[0] && (
                  <>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                    <div className="flex-shrink-0">
                      <PostForAppChecking index={0} reFetch={reFetch} postForApp={post} />
                    </div>
                  </>
                )}

                {/* Bouton d'édition */}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={() => navigate(`/post-for-app/edit/${post.id}`)}
                  className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  title="Modifier le post"
                >
                  <Edit className="w-4 h-4" />
                </button>

                {/* Actions admin - seulement pour superadmin */}
                {user?.role === RoleEnum.SUPERADMIN && (
                  <>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                    <button
                      onClick={() => setSingleSyncOpen(true)}
                      disabled={singleSyncLoading}
                      className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                      title="Synchroniser"
                    >
                      <RefreshCw className={`w-4 h-4 ${singleSyncLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <button
                      onClick={handleToggleBan}
                      className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                        post.isBanned
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                      }`}
                      title={post.isBanned ? 'Débannir' : 'Bannir'}
                    >
                      {post.isBanned ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                    </button>
                  </>
                )}
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                {/* Navigation compacte */}
                <NavigationControls
                  hasPrev={hasPrev}
                  hasNext={hasNext}
                  prevPost={prevPost ? String(prevPost.id) : undefined}
                  nextPost={nextPost ? String(nextPost.id) : undefined}
                  onNavigate={handleNavigate}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-6xl mx-auto"
      >
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Overlay banni */}
          <BannedOverlay
            isBanned={post.isBanned}
            showCover={showCover}
            onToggle={() => setShowCover(!showCover)}
            postTitle={post.titles?.[0]?.title}
          />

          {/* Grille d'informations */}
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              <InfoItem
                label="Référence"
                value={`POST-${postId}`}
                icon={<Tag className="w-4 h-4" />}
              />
              
              <InfoItem
                label="Plateforme"
                value={post.plateform.name}
                icon={<Film className="w-4 h-4" />}
              />
              
              {(post as any)?.creatorObj ? (
                <InfoItem
                  label="Créateur"
                  value={
                    <Link 
                      to={`/creators/${post.creatorObj.id}`}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <img
                        src={post.creatorObj.avatar}
                        alt={post.creatorObj.name}
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                      <span className="truncate">{post.creatorObj.name}</span>
                    </Link>
                  }
                  icon={<User className="w-4 h-4" />}
                />
              ) : post.creator ? (
                <InfoItem
                  label="Créateur"
                  value={<span className="truncate">{post.creator}</span>}
                  icon={<User className="w-4 h-4" />}
                />
              ) : null}
              
              <InfoItem
                label="Catégorie"
                value={<span className="truncate">{post.postCategory?.name}</span>}
                icon={<Tag className="w-4 h-4" />}
              />
              
              <InfoItem
                label="Sous-catégorie"
                value={<span className="truncate">{post.postSubCategory?.name}</span>}
                icon={<Tag className="w-4 h-4" />}
              />
              
              <InfoItem
                label="Publication"
                value={new Date(post.published_at).toLocaleDateString('fr-FR')}
                icon={<Calendar className="w-4 h-4" />}
              />
              
              <InfoItem
                label="Création"
                value={new Date(post.createdAt).toLocaleDateString('fr-FR')}
                icon={<Calendar className="w-4 h-4" />}
              />
            </div>

            {/* Tags */}
            {Array.isArray((post as any)?.tagCategory) && (post as any)?.tagCategory.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(post as any).tagCategory.map((tg: any) => (
                    <span
                      key={tg?.id ?? tg?.name}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium
                               bg-blue-50 text-blue-700 border border-blue-200
                               dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800
                               hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                      title={tg?.meta ? JSON.stringify(tg.meta) : undefined}
                    >
                      #{tg?.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Titres */}
            <GetPostForAppTitles postTitles={post.titles?.map(t => ({ ...t, id: String(t.id), post_for_app_id: String(t.post_for_app_id) }))} />

            {/* Médias */}
            <div className={`transition-all duration-300 ${post.isBanned && showCover ? 'filter blur-sm' : ''}`}>
              <GetImagePostForApp images={post.images} reFetch={reFetch} />
              <GetVideoPostForApp videos={post.videos} reFetch={reFetch} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modal de sync */}
      <SingleSyncModal
        open={singleSyncOpen}
        onClose={() => setSingleSyncOpen(false)}
        onSubmit={handleSingleSync}
        title={`Synchroniser le post #${postId}`}
      />
    </div>
  );
};

export default PostForAppDetails;