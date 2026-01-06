import axios from 'axios';
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UseAppVideo, useNextAppVideo } from "../hooks/app/useAppVideos";
import { formatDateFR } from "../utils/date";
import {
  Edit3,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import SexyShortLoader from "../components/SexyShortLoader";
import type { TVideo } from "../hooks/useVideos";
import { apiURL } from '../constant';
import { Link, useParams } from 'react-router-dom';
import { MangaTitlesViewer } from "../components/MangaTitlesViewer";
import type { MangaTitles } from "../types/mangaTitles";
import VideoPlayer from "../components/VideoPlayer";
import toast from "react-hot-toast";
import { usePlatformReactive } from '../hooks/usePlatform';
import { useAuthMe } from '../hooks/useAuth';
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import AnimatedAlert from "../components/AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../hooks/useAnimatedAlert";
import useSocketSend from "../hooks/useSocketSend";
import RoleEnum from "../utils/roleEnum";
import { updateVideoForApp, updateVideoForAppBannedStatus } from "../api/videoForApp";


// Helper function to get category display name
const getCategoryDisplayName = (categories?: Array<{code: string, name: string}>): string => {
  if (!categories || categories.length === 0) return 'No category';

  // Try to find English name first, then fallback to any available
  const englishName = categories.find(cat => cat.code === 'en')?.name;
  if (englishName) return englishName;

  // Fallback to first available name
  return categories[0].name;
};

// Helper function to get subcategory display name
const getSubCategoryDisplayName = (subCategories?: Array<{code: string, name: string}>): string => {
  if (!subCategories || subCategories.length === 0) return 'No subcategory';

  // Try to find English name first, then fallback to any available
  const englishName = subCategories.find(sub => sub.code === 'en')?.name;
  if (englishName) return englishName;

  // Fallback to first available name
  return subCategories[0].name;
};

// Helper function to get platform display name
const getPlatformDisplayName = (platform?: {id: number, name: string}): string => {
  if (!platform) return 'No platform';
  return platform.name;
};
 

const VideoForAppDetails: React.FC = () => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();

  const { data: video, reFetch, loading } = UseAppVideo(routeId);
  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextAppVideo(routeId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);
  const [showCover, setShowCover] = useState<boolean>(true);

  // Platform data
  const { data: platforms } = usePlatformReactive();
  const [platform, setPlatform] = useState<{ id: number; name: string } | null>(null);

  // Convert VideoForApp titles to MangaTitles format for i18n display
  const videoTitles: MangaTitles = video ? [
    ...(video.cn_title ? [{ i18_language: 'zh' as any, title: video.cn_title, description: '' }] : []),
    ...(video.en_title ? [{ i18_language: 'en' as any, title: video.en_title, description: '' }] : []),
    ...(video.hi_title ? [{ i18_language: 'hi' as any, title: video.hi_title, description: '' }] : []),
  ] : [];

  useEffect(() => {
    if (video?.plateform_id && platforms) {
      const videoPlatform = platforms.find(p => p.id === video.plateform_id);
      setPlatform(videoPlatform || null);
    }
  }, [video?.plateform_id, platforms]);

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);

  useSocketSend(reFetch);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-red-500 text-xl font-medium"
        >
          App Video not found
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
            {/* Edit form can be added here */}
            <div>Edit Mode</div>
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
                      {video?.creatorObj && (
                        <div className="">
                          <div className="flex items-start gap-3">
                            {video.creatorObj.avatar ? (
                              <img
                                src={video.creatorObj.avatar}
                                alt={video.creatorObj.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                {video.creatorObj.name?.charAt(0) || "U"}
                              </div>
                            )}
                            <div>
                              <Link to={'/creators/' + video.creatorObj.id} className="text-gray-800 dark:text-gray-200 font-medium">
                                {video.creatorObj.name}
                              </Link>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {formatDateFR(video.createdAt)}
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
                    className="flex items-center gap-4"
                  >
                    {/* Navigation */}
                    <div className="flex items-center gap-2">
                      {hasPrev && (
                        <Link
                          to={`/app-videos/${prevVideo?.id}`}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Link>
                      )}
                      {hasNext && (
                        <Link
                          to={`/app-videos/${nextVideo?.id}`}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/app-videos/${video.id}/edit`}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center"
                      >
                        <Edit3 className="w-5 h-5" />
                      </Link>

                      <button
                        onClick={async () => {
                          const should = window.confirm(
                            video.isBanned ? "Are you sure you want to unban this video?" : "Are you sure you want to ban this video?"
                          );
                          if (!should) return;
                          try {
                            await updateVideoForAppBannedStatus(video.id, !video.isBanned);
                            toast.success(`Video ${!video.isBanned ? 'banned' : 'unbanned'} successfully`);
                            reFetch();
                          } catch (error: any) {
                            toast.error(error?.response?.data?.message || 'Failed to update banned status');
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors flex items-center ${
                          video.isBanned
                            ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800"
                            : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800"
                        }`}
                        title={video.isBanned ? "Unban video" : "Ban video"}
                      >
                        {video.isBanned ? "🔓" : "🚫"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Player */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="lg:col-span-2"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className={`aspect-video bg-black relative ${video.isBanned ? "ring-4 ring-red-500 ring-opacity-50" : ""}`}>
                      {video.isBanned && (
                        <div className="absolute inset-0 z-20 flex items-start justify-end p-3 pointer-events-none">
                          <div className="flex gap-2 pointer-events-auto">
                            <button
                              onClick={() => {
                                const next = !showCover;
                                setShowCover(next);
                                localStorage.setItem(`app-video-show-cover-${routeId}`, String(next));
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
                            hlsUrl: video?.m3u8_path,
                            coverUrl: video?.s3_urls?.coverUrl,
                          }}
                          poster={video?.cover}
                          className="w-full h-full"
                          isForApp={true}
                          autoPlay={true}
                        />
                      </div>
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
                  {/* Checking */}
                  {user?.role === RoleEnum.SUPERADMIN && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                      <CheckingSuperadmin
                        video={video as unknown as TVideo}
                        user={user}
                        updateFn={updateVideoForApp}
                        reFetch={reFetch}
                        index={0}
                      />
                    </div>
                  )}

                  {/* Cover */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="text-lg font-semibold mb-4">Cover</h3>
                    <img
                      src={video?.public_urls.coverUrl || video?.s3_urls.coverUrl || 'https://placehold.co/300x200'}
                      alt="Cover"
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Info */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
                    <div className="space-y-4">
                      <div>
                        <MangaTitlesViewer
                          titles={videoTitles}
                          titleClassName="text-base font-normal text-gray-800 dark:text-gray-200 mt-1"
                          allowViewAll={true}
                        />
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {video.seconds}s
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {getCategoryDisplayName(video.categories)}
                      </div>
                      <div>
                        <span className="font-medium">Sub Category:</span> {getSubCategoryDisplayName(video.sub_categories)}
                      </div>
                      <div>
                        <span className="font-medium">Platform:</span> {getPlatformDisplayName(video.plateform)}
                      </div>
                      <div>
                        <span className="font-medium">Video Type:</span>{' '}
                        {video.type === "1" ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 ml-1">Short</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ml-1">Long</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">VIP:</span>{' '}
                        {video.need_vip ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 ml-1">VIP</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500 dark:bg-gray-800/30 dark:text-gray-400 ml-1">No VIP</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Tags:</span>
                        {video.tagCategoryVideos && video.tagCategoryVideos.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {video.tagCategoryVideos.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 ml-1">No tags</span>
                        )}
                      </div>
                    </div>
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

export default VideoForAppDetails;
