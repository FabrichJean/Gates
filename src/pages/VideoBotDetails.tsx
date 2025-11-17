/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { UseBotVideo } from "../hooks/bot/useBotVideos";
import { FaPlayCircle } from "react-icons/fa";
import { formatDateFR } from "../utils/date";
import {
  activateVideoBot,
  sendVideoBotToServer,
  cancelVideoBotUpload,
  updateVideoBot,
  convertBotVideoToMp4,
} from "../api/videoBot";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import AnimatedAlert from "../components/AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../hooks/useAnimatedAlert";
import CheckingSuperadmin from "../components/CheckingSuperadmin";

const VideoBotDetails: React.FC = () => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();

  const { data: video, reFetch } = UseBotVideo(routeId);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);

  // Update cover URL when video data changes
  useEffect(() => {
    setCurrentCoverUrl((video?.s3_urls?.coverUrl || video?.public_urls.cover_url || video?.cover) + "?t=" + Date.now());
  }, [video]);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Bot Video not found</div>
      </div>
    );

  const send = async (videoId: number) => {
    try {
      await sendVideoBotToServer(videoId);
      toast.success("✅ Upload workflow started");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d'envoi !");
    }
  };

  const cancel = async (videoId: number) => {
    await cancelVideoBotUpload(videoId)
      .then(reFetch)
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  const activate = async (videoId: number) => {
    try {
      await activateVideoBot(videoId);
      toast.success("✅ Video activated");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Activation error!");
    }
  };

  const [converting, setConverting] = useState(false);

  const convertToMp4 = async () => {
    if (converting) return;
    setConverting(true);
    try {
      await convertBotVideoToMp4(video.id);
      toast.success("✅ Conversion MP4 démarrée !");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur de conversion!");
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      <AnimatedAlert {...alertProps} />
      <div className="flex flex-col md:flex-row gap-8 p-6 items-start justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
        <div className="w-full md:w-[60%] bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6 transition-all duration-300">
          <div className="flex justify-between gap-4 items-center w-full">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 transition-colors duration-300">
              Bot Video - {formatDateFR(video?.createdAt)}
            </h2>
            <div className="flex gap-2">
              <CheckingSuperadmin
                index={0}
                reFetch={reFetch}
                resource={video}
                user={user}
                updateFn={updateVideoBot}
                hideTouchLink={true}
              />
            </div>
          </div>

          <div className="relative w-full h-[400px] rounded-lg flex items-center justify-center bg-black">
            {videoPlayed ? (
              <video
                src={video.s3_cover_path || video.public_urls.temp_url}
                className="w-full h-full object-cover rounded-lg"
                controls
                autoPlay
              ></video>
            ) : (
              <>
                <FaPlayCircle
                  className="absolute text-8xl text-white cursor-pointer z-10"
                  onClick={() => setVideoPlayed(true)}
                />
                <img
                  src={currentCoverUrl || video.public_urls.cover_url}
                  alt="cover"
                  className="w-full h-full object-cover rounded-lg"
                />
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-4 w-full">
            {user?.role === RoleEnum.SUPERADMIN && (
              <div className="relative flex items-center gap-3">
                <button
                  disabled={video.processing === "working" || video.processing === "done"}
                  onClick={() => {
                    if (video.checking !== "checked") {
                      return alert.warning("We need to check this video", "Video Check Required");
                    }
                    send(video.id);
                  }}
                  className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2.5 font-medium hover:text-blue-500 text-sm rounded-md transition-all duration-300 ${
                    video.processing === "working" || (video.upload_status === 1 && video.transfer_status === 1)
                      ? "cursor-not-allowed bg-gray-100 dark:bg-gray-100/10 text-gray-500"
                      : "cursor-pointer bg-transparent hover:bg-white text-gray-700 dark:text-gray-100 border border-blue-300 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  }`}
                >
                  {video.processing === "working" ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : video.upload_status === 1 && video.transfer_status === 1 ? (
                    <span className="text-green-600 font-semibold flex gap-1 items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Uploaded
                    </span>
                  ) : (
                    <span className="hover:text-blue-500 flex gap-3 items-center">
                      <span>🚀</span>
                      <span>Send</span>
                    </span>
                  )}
                </button>

                {video.processing === "working" && (
                  <button
                    onClick={cancel.bind(null, video.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                )}

                <button
                  onClick={() => activate(video.id)}
                  className="relative flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm rounded-md transition-all duration-300 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
                >
                  Activate
                </button>

                <button
                  onClick={convertToMp4}
                  disabled={converting}
                  className="relative flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm rounded-md transition-all duration-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {converting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Converting...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                      </svg>
                      <span>Convert MP4</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <Link
              to="/bot-videos"
              className="relative flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-all duration-300 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
            >
              Back to List
            </Link>
          </div>

          {/* Video Info */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Title:</span>
                <p className="text-gray-800 dark:text-gray-200">{video.titles?.[0]?.title || "N/A"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <p className="text-gray-800 dark:text-gray-200">{video.checking || "pending"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Processing:</span>
                <p className="text-gray-800 dark:text-gray-200">{video.processing || "pending"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Creator:</span>
                <p className="text-gray-800 dark:text-gray-200">{video.creator || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoBotDetails;
