import axios from 'axios';
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UseAppVideo, useNextAppVideo } from "../hooks/app/useAppVideos";
import { formatDateFR } from "../utils/date";
import {
  updateVideoForApp,
} from "../api/videoForApp";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import useSocketSend from "../hooks/useSocketSend";
import AnimatedAlert from "../components/AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../hooks/useAnimatedAlert";
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
} from "lucide-react";
import SexyShortLoader from "../components/SexyShortLoader";
import type { TVideo } from "../hooks/useVideos";
import { apiURL } from '../constant';
import { Link, useParams } from 'react-router-dom';
import { MangaTitlesViewer } from "../components/MangaTitlesViewer";
import type { MangaTitles } from "../types/mangaTitles";

const VideoForAppDetails: React.FC = () => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();

  const { data: video, reFetch, loading } = UseAppVideo(routeId);
  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextAppVideo(routeId);
  const [videoPlayed, setVideoPlayed] = useState(false);

  const [modifying, setModifying] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  // Convert VideoForApp titles to MangaTitles format for i18n display
  const videoTitles: MangaTitles = video ? video.titles : [];

  useEffect(() => {
    if (video?.m3u8_path) {
      // Fetch the M3U8 content from the backend play endpoint using axios
      axios.post(apiURL+'/videos-for-app/play', { url: video.m3u8_path }, { responseType: 'text' })
        .then(response => {
          const blob = new Blob([response.data], { type: 'application/vnd.apple.mpegurl' });
          const url = URL.createObjectURL(blob);
          setVideoSrc(url);
        })
        .catch(err => console.error('Failed to load M3U8', err));
    }
  }, [video?.m3u8_path]);

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);

  useSocketSend(reFetch);

  const send = async (videoId: number) => {
    // Implement send logic if needed
    toast.success("✅ Send action");
    reFetch();
  };

  const cancel = async (videoId: number) => {
    // Implement cancel logic if needed
    toast.success("✅ Cancel action");
    reFetch();
  };

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
                      <button
                        onClick={() => setModifying(true)}
                        className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => send(video.id)}
                        className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                      >
                        <Send className="w-5 h-5" />
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
                    <div className="aspect-video bg-black relative">
                      {videoSrc ? (
                        <video
                          controls
                          className="w-full h-full"
                          poster={video.cover || undefined}
                        >
                          <source src={videoSrc} type="application/x-mpegURL" />
                        </video>
                      ) : (
                        <div className="flex items-center justify-center h-full text-white">
                          Loading video...
                        </div>
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
                    <h3 className="text-lg font-semibold mb-4">Info</h3>
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium">Titles:</span>
                        <MangaTitlesViewer
                          titles={videoTitles}
                          titleClassName="text-base font-normal text-gray-800 dark:text-gray-200 mt-1"
                          allowViewAll={true}
                        />
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {video.seconds}s
                      </div>
                    </div>
                  </div>

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
