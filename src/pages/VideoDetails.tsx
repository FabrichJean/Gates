/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect } from "react";
import { RiVipCrown2Fill } from "react-icons/ri";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TitlesForm, type Couple } from "./Upload";
import { useNextVideo, UseVideo, type TVideo } from "../hooks/useVideos";
import { formatDateFR } from "../utils/date";
import type { Category } from "../components/CategoryAutoComplete";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import {
  cancelUpload,
  sendProcessing,
  updateVideo,
<<<<<<< HEAD
  singleSync,
=======
  toggleBannedStatus,
  updateBannedStatus,
>>>>>>> a76bf2379bab6e279223f9de87d04a92f0493989
} from "../api/videos";
import SingleSyncModal from "../components/SingleSyncModal";
import type { SubCategory } from "../hooks/useSubCategory";
import SubCategoryAutoComplete from "../components/SubCategoryAutoComplete";
import CreatorAutoComplete from "../components/CreatorAutoComplete";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import useSocketSend from "../hooks/useSocketSend";
import AnimatedAlert from "../components/AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../hooks/useAnimatedAlert";
import { useVideosContext } from "../context/VideosContext";
import { getTagCategoriesApi } from "../api/tagCategory";
import type { Platform } from "../hooks/usePlatform";
import PlatformSelectComponent from "../components/PlatformSelectComponent";
import GetPostTitles from "./posts/GetPostTitles";
import {
  Play,
  Edit3,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Film,
  Tag,
  Globe,
  Clock,
  Upload,
  Image,
  ChevronDown,
  Plus,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import SexyShortLoader from "../components/SexyShortLoader";
import { apiURL, token } from "../constant";
import {VideoPlayer} from "../components/VideoPlayer";

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const [singleSyncOpen, setSingleSyncOpen] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);

  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const { data: video, reFetch, loading } = UseVideo(videoId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [showCover, setShowCover] = useState<boolean>(true);

  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextVideo(routeId);
  const isPortrait = React.useMemo(() => {
    return video?.type === "1";
  }, [video]);

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);

  useSocketSend(reFetch);

  useEffect(() => {
    setCurrentCoverUrl(
      (video?.s3_urls?.coverUrl ||
        video?.public_urls.local_cover_url ||
        video?.cover) +
      "?t=" +
      Date.now()
    );
  }, [video]);


  const send = async (videoId: number) => {
    try {
      await sendProcessing(videoId);
      toast.success("✅ upload workflow started");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d'envoi !");
    }
  };

  const cancel = async (videoId: number) => {
    await cancelUpload(videoId)
      .then(reFetch)
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  const handleSingleSync = async (isForce: boolean) => {
    if (!video) return;
    setSingleSyncLoading(true);
    try {
      await singleSync({ entity: "video", origin_id: video.id, isForce });
      toast.success("✅ Sync single exécuté");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur sync single !");
    } finally {
      setSingleSyncLoading(false);
    }
  };

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-red-500 text-xl font-medium"
        >
          Video not found
        </motion.div>
      </div>
    );

  if (loading) {
    return <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20 rounded-xl">
      <SexyShortLoader />
    </div>
  }

  return (
    <>
      <AnimatedAlert {...alertProps} />
      <AnimatePresence mode="wait">
        {modifying ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <EditVideo
              video={video}
              onSubmit={(newCoverUrl?: string) => {
                setModifying(false);
                if (newCoverUrl) {
                  setCurrentCoverUrl(newCoverUrl + "?t=" + Date.now());
                }
                reFetch();
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 dark:bg-gray-950"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center">
                  <div className="flex">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {/* Creator Info */}
                      {(video)?.creatorObj && (
                        <div className="">
                          <div className="flex items-start gap-3">
                            {(video).creatorObj.avatar ? (
                              <img
                                src={(video).creatorObj.avatar}
                                alt={(video).creatorObj.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                              />
                            ) : (
                              <Link to={'/creators/' + video.creatorObj.id} className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                {(video).creatorObj.name?.charAt(0) || "U"}
                              </Link>
                            )}
                            <div>
                              <Link to={'/creators/' + video.creatorObj.id} className="text-gray-800 dark:text-gray-200 font-medium">
                                {(video).creatorObj.name}
                              </Link>
                              {(video).creatorObj.gender && (
                                <div className="text-xs text-gray-500">
                                  {(video).creatorObj.gender}
                                </div>
                              )}
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {formatDateFR(video?.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${video.type === "1"
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          }`}
                      >
                        {video.type === "1" ? "Short" : "Long"}
                      </span>
                      {video?.plateform?.name && (
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium">
                          {video.plateform.name}
                        </span>
                      )}
                    </div>
                    <CheckingSuperadmin
                      index={0}
                      reFetch={reFetch}
                      video={video}
                      user={user}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Player */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-2"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    <div
                      className={`relative overflow-hidden rounded-xl shadow-2xl transition-all duration-300 ${isPortrait
                        ? "max-w-md mx-auto bg-gradient-to-b from-black via-black to-black" // mode short
                        : "aspect-video bg-gradient-to-br from-gray-900 via-black to-black" // mode normal
                        } ${video.isBanned ? "ring-4 ring-red-500 ring-opacity-50" : ""}`}
                    >
                      {video.isBanned && (
                        <div className="absolute inset-0 z-20 flex items-start justify-end p-3 pointer-events-none">
                          <div className="flex gap-2 pointer-events-auto">
                            <button
                              onClick={() => {
                                const next = !showCover;
                                setShowCover(next);
                              }}
                              className="bg-black/40 text-white p-2 rounded-md hover:bg-black/60 transition"
                              title={showCover ? "Hide cover" : "Show cover"}
                            >
                              {showCover ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={`w-full h-full ${video.isBanned && showCover ? 'filter blur-sm brightness-75' : ''}`}>
                        <VideoPlayer
                          videoUrls={{
                            hlsUrl: video?.s3_urls?.hlsUrl,
                            temp_url: video?.public_urls?.temp_url,
                            coverUrl: video?.s3_urls?.coverUrl,
                            cover_url: video?.public_urls?.cover_url
                          }}
                          poster={currentCoverUrl || video?.s3_urls?.coverUrl || video?.public_urls?.cover_url}
                          isPlaying={videoPlayed}
                          onPlay={() => setVideoPlayed(true)}
                          className="w-full h-full"
                          showVipBadge={video?.need_vip || false}
                          autoPlay={true}
                        />
                      </div>

                    </div>

                    {/* Tags Section */}
                    <div className="px-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tags
                        </h3>
                      </div>
                      {Array.isArray((video as any)?.tagCategory) &&
                        (video as any)?.tagCategory.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(video as any).tagCategory.map((tg: any) => (
                            <motion.span
                              key={`${tg?.id ?? tg?.name}-chip`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              title={
                                tg?.meta ? JSON.stringify(tg.meta) : undefined
                              }
                            >
                              #{tg?.name}
                            </motion.span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No tags
                        </span>
                      )}
                    </div>


                    {/* Post Titles */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <GetPostTitles postTitles={video.titles as any} />
                    </div>
                  </div>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  {/* Actions Card */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                      Actions
                    </h2>

                    <div className="space-y-3">
                      {video.checking !== "refused" ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setModifying(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-transparent rounded-lg border transition-all duration-200 shadow-lg hover:shadow-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Video
                        </motion.button>
                      ) : (
                        <Link
                          to={"/touch/video/" + videoId}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:border-orange-300 dark:hover:border-orange-700 rounded-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          Touch Again
                        </Link>
                      )}

                      {user?.role === RoleEnum.SUPERADMIN && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={
                              video.processing === "working" ||
                              video.processing === "done"
                            }
                            onClick={() => {
                              if (video.checking !== "checked") {
                                return alert.warning(
                                  "We need to check this video",
                                  "Video Check Required"
                                );
                              }
                              send(video.id);
                            }}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${video.processing === "working" ||
                              (video.upload_status === 1 &&
                                video.transfer_status === 1)
                              ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400"
                              : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
                              }`}
                          >
                            {video.processing === "working" ? (
                              <>
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </>
                            ) : video.upload_status === 1 &&
                              video.transfer_status === 1 ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Uploaded</span>
                              </div>
                            ) : (
                              <>
                                <Send className="w-4 h-4" />
                                Send to Process
                              </>
                            )}
                          </motion.button>

                          {video.processing === "working" && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={cancel.bind(null, video.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </motion.button>
                          )}

<<<<<<< HEAD
                          {/* bouton single sync */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSingleSyncOpen(true)}
                            className={`w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700`}>
                            Sync
                          </motion.button>
                          <SingleSyncModal
                            open={singleSyncOpen}
                            onClose={() => setSingleSyncOpen(false)}
                            onSubmit={handleSingleSync}
                            title="Synchroniser cette vidéo"
                          />
=======
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                              const should = window.confirm(
                                video.isBanned ? "Are you sure you want to unban this video?" : "Are you sure you want to ban this video?"
                              );
                              if (!should) return;
                              try {
                                await updateBannedStatus(video.id, !video.isBanned);
                                toast.success(`Video ${!video.isBanned ? 'banned' : 'unbanned'} successfully`);
                                reFetch();
                              } catch (error: any) {
                                toast.error(error?.response?.data?.message || 'Failed to update banned status');
                              }
                            }}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                              video.isBanned
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                            }`}
                          >
                            {video.isBanned ? "Unban Video" : "Ban Video"}
                          </motion.button>
>>>>>>> a76bf2379bab6e279223f9de87d04a92f0493989
                        </>
                      )}

                      <div className="flex gap-2 pt-2">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex-1"
                        >
                          <Link
                            to={"/videos/" + prevVideo}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${hasPrev
                              ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              : "bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Link>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex-1"
                        >
                          <Link
                            to={"/videos/" + nextVideo}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${hasNext
                              ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                              : "bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </motion.div>
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }}>
                        <Link
                          to="/videos"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                        >
                          <Film className="w-4 h-4" />
                          Back to Videos
                        </Link>
                      </motion.div>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="space-y-4">
                    {/* Category Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </h3>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {video?.category?.name}
                        </span>
                        <span className="text-gray-500 mx-2">/</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {video?.subCategory?.name}
                        </span>
                      </div>
                    </div>

                    {/* URLs */}
                    {video?.cdn_url && video?.s3_hls_path && (
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CDN Playback URL
                          </h3>
                        </div>
                        <a
                          href={video?.cdn_url + video?.s3_hls_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 break-all hover:underline"
                        >
                          {video?.cdn_url + video?.s3_hls_path}
                        </a>
                      </div>
                    )}

                    {video?.cdn_url && video?.s3_cover_path && (
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CDN Cover URL
                          </h3>
                        </div>
                        <a
                          href={video?.cdn_url + video?.s3_cover_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 break-all hover:underline"
                        >
                          {video?.cdn_url + video?.s3_cover_path}
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoDetails;

// EditVideo component remains the same but with improved styling
function EditVideo({
  video,
  onSubmit,
}: {
  video: TVideo;
  onSubmit: (newCoverUrl?: string) => void;
}) {
  const ctx = useVideosContext();
  if (!ctx) return null;

  const { reFetch: reFetchVideos } = ctx;

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [coverPreview, setCoverPreview] = useState<string | null>(
    video.public_urls.cover_url
  );
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState<number | null>(video?.duration);
  const [platform, setPlatform] = useState<Platform>(video?.plateform);
  const [category, setCategory] = useState<Category>(video?.category);
  const [subcategory, setSubCategory] = useState<SubCategory>(
    video?.subCategory
  );

  const [coupleTitles, setCoupleTitles] = useState<Couple[]>(
    video?.titles?.map((title) => ({
      id: title.id,
      language: title.language,
      i18_language: title.i18_language,
      title: title.title,
      description: title.description,
    })) || []
  );

  const initialCreatorName =
    (video as any)?.creatorObj?.name ??
    (typeof (video as any)?.creator === "string"
      ? (video as any).creator
      : (video as any)?.creator?.name) ??
    null;
  const initialCreatorId =
    (video as any)?.creatorObj?.id ??
    (video as any)?.creator?.id ??
    (video as any)?.creator_id ??
    null;

  const [creator, setCreator] = useState<string | null>(initialCreatorName);
  const [creatorId, setCreatorId] = useState<number | null>(initialCreatorId);
  const [videoType, setVideoType] = useState<string>(
    video?.type === "1" ? "short" : "long"
  );

  const [selectedPostTagCategories, setSelectedPostTagCategories] = useState<
    { id?: number; name: string }[]
  >(
    video.tagCategory?.map((t: any) => ({
      id: t.id,
      name: t.name,
    })) ?? []
  );

  const [needVip, setNeedVip] = useState<boolean>(!!video?.need_vip);

  const [postTagQuery, setPostTagQuery] = useState("");
  const [showPostTagDropdown, setShowPostTagDropdown] = useState(false);
  const [postTagSuggestions, setPostTagSuggestions] = useState<any[]>([]);
  const [availablePostTags, setAvailablePostTags] = useState<
    Array<{ id?: number; name: string; meta?: any }>
  >([]);

  const postTagWrapperRef = useRef<HTMLDivElement | null>(null);

  // Load available tags
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTagCategoriesApi();
        const items = res?.data?.items ?? res?.data ?? [];
        const normalized = (Array.isArray(items) ? items : []).map(
          (it: any) => ({ id: it.id, name: it.name, meta: it.meta ?? null })
        );
        setAvailablePostTags(normalized);
        setPostTagSuggestions(normalized);
      } catch (err) {
        console.warn("Failed to load post tag categories", err);
      }
    };
    load();
  }, []);

  // Filter tag suggestions
  useEffect(() => {
    if (!postTagQuery) {
      setPostTagSuggestions(availablePostTags);
      return;
    }
    const q = postTagQuery.toLowerCase();
    setPostTagSuggestions(
      availablePostTags.filter((t) => t.name.toLowerCase().includes(q))
    );
  }, [postTagQuery, availablePostTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        postTagWrapperRef.current &&
        !postTagWrapperRef.current.contains(event.target as Node)
      ) {
        setShowPostTagDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverClick = () => coverInputRef.current?.click();

  const handleSubmit = async () => {
    const formData: any = {
      ...(coverFile && { cover: coverFile }),
      ...(category && { category_id: category.id }),
      ...(subcategory && { sub_category_id: subcategory.id }),
      ...(creatorId ? { creator_id: creatorId } : creator ? { creator } : {}),
      ...(platform?.id ? { plateform_id: platform.id } : {}),
      ...(videoType ? { type: videoType === "short" ? "1" : "2" } : {}),
      isShort: videoType === "short",
      titles: JSON.stringify(coupleTitles),
      duration,
      need_vip: needVip,
      tagCategory: JSON.stringify(
        selectedPostTagCategories.map((t) => ({
          id: t.id ?? null,
          name: t.name,
        }))
      ),
    };

    try {
      setUploading(true);
      setProgress(0);

      const res = await updateVideo(video.id, formData, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      reFetchVideos();
      toast.success("✅ Video updated successfully!");

      const newCoverUrl = coverFile
        ? res.data?.public_urls?.cover_url || video.public_urls.cover_url
        : undefined;
      onSubmit(newCoverUrl);
    } catch (err: any) {
      console.error(err);
      toast.error("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const addPostTagSuggestion = (tag: any) => {
    if (
      selectedPostTagCategories.some(
        (existing) => existing.name.toLowerCase() === tag.name.toLowerCase()
      )
    ) {
      return;
    }
    setSelectedPostTagCategories((prev) => [...prev, tag]);
    setPostTagQuery("");
  };

  const addPostTagByName = (name: string) => {
    if (!name.trim()) return;
    const existed = selectedPostTagCategories.some(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );
    if (existed) return;
    setSelectedPostTagCategories((prev) => [...prev, { name }]);
    setPostTagQuery("");
  };

  const removeSelectedPostTag = (index: number) => {
    setSelectedPostTagCategories((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4 sm:p-6 transition-all duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Edit Video
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Update video information and settings
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              VIP
            </span>

            <button
              type="button"
              onClick={() => setNeedVip((v) => !v)}
              className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${needVip ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${needVip ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
             <Link
                to={`/touch/video/${video.id}`}
                className="underline"
              >
                Edit with Video
              </Link>
          </div>
          
        </div>

        <div className="flex flex-col gap-8">
          {/* Left Column - Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex md:flex-row flex-col gap-4"
          >
            {/* Cover Image */}
            <div className="bg-white flex-1 dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Image className="w-5 h-5" />
                Cover Image
              </h2>

              <div
                onClick={handleCoverClick}
                className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer group"
              >
                <AnimatePresence mode="wait">
                  {coverPreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="relative w-full"
                    >
                      <img
                        src={coverPreview}
                        alt="Preview"
                        className="rounded-lg object-cover w-full h-64"
                      />
                      <motion.div
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 transition-opacity duration-300"
                      >
                        <div className="bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-lg flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Change Image
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                        Click to upload cover image
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                <Film className="w-5 h-5" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 transition-colors duration-300">
                    Category
                  </label>
                  <CategoryAutoComplete
                    defaultValue={category}
                    onSelect={(cat) => setCategory(cat)}
                  />
                </div>

                {/* Sub Category */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 transition-colors duration-300">
                    Sub Category
                  </label>
                  <SubCategoryAutoComplete
                    categoryId={category?.id}
                    defaultValue={subcategory}
                    onSelect={(cat) => setSubCategory(cat)}
                  />
                </div>

                {/* Creator */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 transition-colors duration-300">
                    Creator (optional)
                  </label>
                  <CreatorAutoComplete
                    value={creator}
                    onChange={(v: string | null) => setCreator(v)}
                    onSelect={(c) => setCreatorId(c?.id ?? null)}
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 transition-colors duration-300">
                    Duration (milliseconds)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="input w-full pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                      defaultValue={duration || 0}
                      onChange={(e) =>
                        setDuration(Number(e.currentTarget.value))
                      }
                    />
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 transition-colors duration-300">
                    Platform
                  </label>
                  <PlatformSelectComponent
                    defaultValue={platform}
                    onSelect={setPlatform}
                  />
                </div>

                {/* Video Type */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3 transition-colors duration-300">
                    Video Type
                  </label>
                  <div className="relative">
                    <Film className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      className="w-full appearance-none pl-10 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                    >
                      <option value="short">Short Video</option>
                      <option value="long">Long Video</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* Tags Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h2>

            <div className="space-y-4">
              <div className="relative" ref={postTagWrapperRef}>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={postTagQuery}
                      onChange={(e) => {
                        setPostTagQuery(e.target.value);
                        setShowPostTagDropdown(true);
                      }}
                      onFocus={() => setShowPostTagDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addPostTagByName(postTagQuery);
                          setShowPostTagDropdown(false);
                        }
                      }}
                      placeholder="Type tag name or select suggestion..."
                      className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg p-3 pr-10 outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                    />
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => {
                      addPostTagByName(postTagQuery);
                      setShowPostTagDropdown(false);
                    }}
                    className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showPostTagDropdown &&
                    postTagSuggestions &&
                    postTagSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
                      >
                        {postTagSuggestions.map((s, index) => (
                          <motion.button
                            key={s.id ?? s.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            type="button"
                            onClick={() => {
                              addPostTagSuggestion(s);
                              setShowPostTagDropdown(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 text-gray-700 dark:text-gray-300"
                          >
                            {s.name}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {selectedPostTagCategories.map((t, i) => (
                    <motion.span
                      key={`${t.id ?? "new"}-${t.name}-${i}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 px-4 py-2 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{t.name}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedPostTag(i)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Column - Titles Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <TitlesForm
              btnSubmit={
                <div className="flex items-center gap-2">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" />
                  Update Video
                </div>
              }
              coupleTitles={coupleTitles}
              setCoupleTitles={setCoupleTitles}
              progress={progress}
              uploading={uploading}
              handleSubmit={handleSubmit}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
