/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TitlesForm, type Couple } from "./Upload";
import { useNextVideo, UseVideo, type TVideo } from "../hooks/useVideos";
import { formatDateFR } from "../utils/date";
import type { Category } from "../components/CategoryAutoComplete";
import CategoryAutoComplete from "../components/CategoryAutoComplete";
import {
  archiveVideo,
  cancelUpload,
  deletePerm,
  sendProcessing,
  updateVideo,
} from "../api/videos";
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
  Trash2, 
  Archive,
  Film,
  User,
  Calendar,
  Tag,
  Globe,
  Clock,
  Upload
} from "lucide-react";

const VideoDetails: React.FC<{ videoIdProp?: string }> = ({ videoIdProp }) => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();
  const videoId = videoIdProp || routeId;

  const { data: video, reFetch } = UseVideo(videoId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);

  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextVideo(routeId);
  const navigate = useNavigate();

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);

  useSocketSend(reFetch);

  useEffect(() => {
    setCurrentCoverUrl(
      (video?.s3_urls?.coverUrl ||
        video?.public_urls.cover_url ||
        video?.cover) +
        "?t=" +
        Date.now()
    );
  }, [video]);

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

  const deleteVideo = async (
    id: string | number,
    type: "archive" | "delete"
  ) => {
    try {
      if (type === "archive") {
        await archiveVideo(id);
        toast.success("Video archived successfully");
        navigate("/videos");
      } else {
        await deletePerm(id);
        toast.success("Video deleted successfully");
        navigate("/videos");
      }
    } catch (error) {
      toast.error("Error deleting video");
    }
  };

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
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Video Details
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {formatDateFR(video?.createdAt)}
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        video.type === "1" 
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
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
                    <div className="relative aspect-video bg-black group">
                      {videoPlayed ? (
                        <video
                          src={video.s3_urls.hlsUrl || video.public_urls.temp_url}
                          className="w-full h-full object-cover"
                          controls
                          autoPlay
                        />
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setVideoPlayed(true)}
                            className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                          >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200">
                              <Play className="w-10 h-10 text-white ml-1" />
                            </div>
                          </motion.div>
                          <img
                            src={
                              currentCoverUrl ||
                              video.s3_urls.coverUrl ||
                              video.public_urls.cover_url
                            }
                            alt="cover"
                            className="w-full h-full object-cover"
                          />
                        </>
                      )}
                    </div>

                    {/* Tags Section */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags</h3>
                      </div>
                      {Array.isArray((video as any)?.tagCategory) && (video as any)?.tagCategory.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {(video as any).tagCategory.map((tg: any) => (
                            <motion.span
                              key={`${tg?.id ?? tg?.name}-chip`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              title={tg?.meta ? JSON.stringify(tg.meta) : undefined}
                            >
                              #{tg?.name}
                            </motion.span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No tags</span>
                      )}
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
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Actions</h2>
                    
                    <div className="space-y-3">
                      {video.checking !== "refused" ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setModifying(true)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Video
                        </motion.button>
                      ) : (
                        <Link
                          to={"/touch/video/" + videoId}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg"
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
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                              video.processing === "working" ||
                              (video.upload_status === 1 && video.transfer_status === 1)
                                ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400"
                                : "cursor-pointer bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg"
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
                        </>
                      )}

                      <div className="flex gap-2 pt-2">
                        <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
                          <Link
                            to={"/videos/" + prevVideo}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                              hasPrev 
                                ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                : "bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} className="flex-1">
                          <Link
                            to={"/videos/" + nextVideo}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                              hasNext 
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

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          const modal = document.getElementById("delete_modal") as HTMLDialogElement;
                          modal?.showModal();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                    </div>
                  </div>

                  {/* Info Cards */}
                  <div className="space-y-4">
                    {/* Author Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Author</h3>
                      </div>
                      <Link
                        to={`/users/${video.user?.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                      >
                        {video.user?.username}
                      </Link>
                    </div>

                    {/* Creator Info */}
                    {(video as any)?.creatorObj && (
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-gray-500" />
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Creator</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          {(video as any).creatorObj.avatar ? (
                            <img
                              src={(video as any).creatorObj.avatar}
                              alt={(video as any).creatorObj.name}
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold">
                              {(video as any).creatorObj.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="text-gray-800 dark:text-gray-200 font-medium">
                              {(video as any).creatorObj.name}
                            </div>
                            {(video as any).creatorObj.gender && (
                              <div className="text-xs text-gray-500">
                                {(video as any).creatorObj.gender}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</h3>
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

                    {/* Post Titles */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                      <GetPostTitles postTitles={(video.titles as any)} />
                    </div>

                    {/* URLs */}
                    {video?.cdn_url && video?.s3_hls_path && (
                      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">CDN Playback URL</h3>
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
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">CDN Cover URL</h3>
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

            {/* Delete Modal */}
            <dialog id="delete_modal" className="modal modal-bottom sm:modal-middle">
              <div className="modal-box bg-white dark:bg-gray-800 border dark:border-gray-700">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
                  Delete Video
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose an action for this video:
                </p>
                <div className="modal-action flex flex-col gap-3">
                  <form method="dialog" className="flex flex-col gap-3 w-full">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={deleteVideo.bind(null, video.id, "archive")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-lg transition-all duration-200"
                    >
                      <Archive className="w-4 h-4" />
                      Archive Video
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={deleteVideo.bind(null, video.id, "delete")}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                  </form>
                </div>
              </div>
            </dialog>
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
  // @ts-ignore
  const [coupleTitles, setCoupleTitles] = useState<Couple[]>(
    video?.titles?.map((title) => ({
      id: title.id, // or title.video_id if that's more appropriate
      language: title.language,
      i18_language: title.i18_language,
      title: title.title,
      description: title.description,
    })) || []
  );
  // prefer creatorObj when available; keep both creator name and possible id
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

      toast.success("✅ successfull !");

      // Si une nouvelle cover a été uploadée, passer la nouvelle URL
      const newCoverUrl = coverFile
        ? res.data?.public_urls?.cover_url || video.public_urls.cover_url
        : undefined;
      onSubmit(newCoverUrl);
    } catch (err: any) {
      console.error(err);
      toast.error("❌ Error: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const postTagWrapperRef = useRef<HTMLDivElement | null>(null);
  // TAGS
  const [postTagQuery, setPostTagQuery] = useState("");
  const [showPostTagDropdown, setShowPostTagDropdown] = useState(false);

  // suggestions récupérées depuis API (à adapter)
  const [postTagSuggestions, setPostTagSuggestions] = useState<any[]>([]);
  const [availablePostTags, setAvailablePostTags] = useState<
    Array<{ id?: number; name: string; meta?: any }>
  >([]);

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

  // tags sélectionnés
  const [selectedPostTagCategories, setSelectedPostTagCategories] = useState<
    { id?: number; name: string }[]
  >(
    video.tagCategory?.map((t: any) => ({
      id: t.id,
      name: t.name,
    })) ?? []
  );

  const addPostTagSuggestion = (tag: any) => {
    // éviter les doublons
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
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-6 transition-all duration-300">
      {/* <Toaster position="top-right" /> */}
      <div className="flex flex-col w-full">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6 self-start transition-colors duration-300">
          Edit
        </h1>
        <div className="flex md:flex-row flex-col gap-7 w-max bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Category
              </label>
              <CategoryAutoComplete
                defaultValue={category}
                onSelect={(cat) => setCategory(cat)}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Sub Category
              </label>
              <SubCategoryAutoComplete
                categoryId={category?.id}
                defaultValue={subcategory}
                onSelect={(cat) => setSubCategory(cat)}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Creator (optional)
              </label>
              <CreatorAutoComplete
                value={creator}
                onChange={(v: string | null) => setCreator(v)}
                onSelect={(c) => setCreatorId(c?.id ?? null)}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Duration ( ms)
              </label>
              <input
                type="number"
                className="input w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                defaultValue={duration || 0}
                onChange={(e) => setDuration(Number(e.currentTarget.value))}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Platform
              </label>
              <PlatformSelectComponent defaultValue={platform} onSelect={setPlatform} />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Type
              </label>
              <div className="relative w-full">
                <select
                  className="w-full appearance-none text-black dark:text-white border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 pr-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-900 transition-all duration-300 shadow-sm cursor-pointer"
                  value={videoType}
                  onChange={(e) => setVideoType(e.target.value)}
                >
                  <option value="short" className="cursor-pointer">
                    Short
                  </option>
                  <option value="long" className="cursor-pointer">
                    Long
                  </option>
                </select>
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M7 8l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="relative w-full" ref={postTagWrapperRef}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tags:
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
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
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md p-2 outline-none focus:border-blue-500 transition-all duration-300"
                  />

                  {showPostTagDropdown &&
                    postTagSuggestions &&
                    postTagSuggestions.length > 0 && (
                      <ul className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded mt-1 max-h-48 overflow-y-auto shadow-lg">
                        {postTagSuggestions.slice(0, 8).map((s) => (
                          <li
                            key={s.id ?? s.name}
                            onClick={() => {
                              addPostTagSuggestion(s);
                              setShowPostTagDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                          >
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addPostTagByName(postTagQuery);
                    setShowPostTagDropdown(false);
                  }}
                  className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700"
                >
                  Add
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {selectedPostTagCategories.map((t, i) => (
                  <span
                    key={`${t.id ?? "new"}-${t.name}-${i}`}
                    className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{t.name}</span>
                    <button
                      onClick={() => removeSelectedPostTag(i)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">
                Cover Image
              </label>
              <div
                onClick={handleCoverClick}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 cursor-pointer relative"
              >
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="rounded-lg object-cover w-full h-52"
                  />
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2 transition-colors duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A4.5 4.5 0 1115.9 6H16a4 4 0 110 8h-1m-3 4l-4-4m0 0l4-4m-4 4h12"
                      />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center transition-colors duration-300">
                      Click or drag an image (PNG, JPG, WEBP)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Barre de progression */}
            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full overflow-hidden transition-colors duration-300">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-colors duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>

          <TitlesForm
            btnSubmit="✏️ update"
            coupleTitles={coupleTitles}
            setCoupleTitles={setCoupleTitles}
            progress={progress}
            uploading={uploading}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}