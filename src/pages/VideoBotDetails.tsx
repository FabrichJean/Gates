/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { UseBotVideo, useNextBotVideo } from "../hooks/bot/useBotVideos";
import { FaPlayCircle } from "react-icons/fa";
import {
  sendVideoBotToServer,
  cancelVideoBotUpload,
  updateVideoBot,
  convertBotVideoToMp4,
} from "../api/videoBot";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
// Animated alerts handled inside VideoActions now
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import VideoActions from "../components/videos/VideoActions";
import useSocketSend from "../hooks/useSocketSend";
import Titles from "./posts/GetPostTitles";

const VideoBotDetails: React.FC = () => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();

  const { data: video, reFetch } = UseBotVideo(routeId);
  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextBotVideo(routeId);

  const [videoPlayed, setVideoPlayed] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>();

  // no local animated alert; VideoActions uses its own hooks

  // Update cover URL when video data changes
  useEffect(() => {
    if (video) {
      setCurrentCoverUrl(
        (video?.s3_urls?.coverUrl ||
          video?.public_urls.cover_url ||
          video?.cover || "https://placehold.co/600x400") +
          "?t=" +
          Date.now()
      );
    }
  }, [video]);

  useSocketSend(reFetch);

  const send = async (videoId: number) => {
    try {
      await sendVideoBotToServer(videoId);
      toast.success("✅ Upload workflow started");
      reFetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "❌ Erreur d'envoi !");
    }
  };

  const downloadAsMp4 = async (url: string, filename: string) => {
    try {
      // Récupère le fichier depuis le lien (blob ou url normal)
      const response = await fetch(url);

      if (!response.ok) {
        toast.error("Erreur lors du téléchargement du fichier !");
        return;
      }

      // Convertir en Blob MP4
      const blob = await response.blob();

      // Créer un objectURL temporaire pour télécharger
      const a = document.createElement("a");
      const objectUrl = URL.createObjectURL(blob);

      a.href = objectUrl;
      a.download = filename.endsWith(".mp4") ? filename : filename + ".mp4";
      document.body.appendChild(a);
      a.click();

      // Nettoyage
      a.remove();
      URL.revokeObjectURL(objectUrl);

      toast.success("Téléchargement lancé !");
    } catch (err) {
      console.error(err);
      toast.error("Impossible de télécharger la vidéo !");
    }
  };

  // cancel and convert actions are handled by VideoActions via passed functions

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Bot Video not found</div>
      </div>
    );

  return (
    <>
      {/* Alerts are handled inside child components */}
      <div className="flex flex-col md:flex-row gap-8 p-6 items-start justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
        <div className="w-full md:w-[60%] bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6 transition-all duration-300">
          <div className="flex justify-between gap-4 items-center w-full">
            <div className="flex items-center gap-2">
              {video?.creatorObj?.avatar ? (
                <img
                  src={video?.creatorObj.avatar}
                  alt={video?.creatorObj.name}
                  className="min-w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">
                  No
                </div>
              )}
              <div>{video?.creatorObj?.name ?? video.creator ?? "-"}</div>

              <span
                aria-label={video.type === "1" ? "Short video" : "Long video"}
                className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold transition-colors duration-200 ${
                  video.type === "1"
                    ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200"
                }`}
              >
                {video.type === "1" ? "SHORT" : "LONG"}
              </span>
            </div>
            <div className="flex gap-2">
              {video?.plateform?.name && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200 text-xs font-medium">
                  {video.plateform.name}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="w-max">
              <CheckingSuperadmin
                index={0}
                reFetch={reFetch}
                resource={video}
                user={user}
                updateFn={updateVideoBot}
                hideTouchLink={true}
                isDetails
              />
            </div>
          </div>

          <div className="relative w-full h-[400px] rounded-lg flex items-center justify-center bg-black">
            {videoPlayed ? (
              <video
                src={video.s3_urls.hlsUrl || video.public_urls.temp_url}
                className="w-full h-full object-cover rounded-lg"
                controls
                autoPlay
              ></video>
            ) : (
              <>
                <FaPlayCircle
                  className="absolute text-8xl text-white cursor-pointer z-10"
                  onClick={() =>
                    setVideoPlayed(
                      video.s3_urls.hlsUrl || video.public_urls.temp_url
                        ? true
                        : false
                    )
                  }
                />
                <img
                  src={
                    currentCoverUrl ??
                    video.s3_urls.coverUrl ??
                    video.public_urls.cover_url
                    ?? "https://placehold.co/600x400"
                  }
                  alt="cover"
                  className="w-full h-full object-cover rounded-lg"
                />
              </>
            )}
          </div>

          {/* Tag Category chips */}
          <div className="col-span-2 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
            {Array.isArray(video?.tagCategoryVideos) &&
            video?.tagCategoryVideos.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-1">
                {video.tagCategoryVideos.map((tg: any) => (
                  <span
                    key={`${tg?.id ?? tg?.name}-chip`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                    title={tg?.meta ? JSON.stringify(tg.meta) : undefined}
                  >
                    #{tg?.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                No tags
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 w-full">
            {/* Edit Button */}
            {video.checking !== "refused" && (
              <Link
                to={`/bot-videos/${video.id}/edit`}
                className="relative flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5
                  font-medium text-sm rounded-md transition-all duration-300
                  backdrop-blur-md border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500
                  bg-white/90 dark:bg-gray-700/90 hover:bg-white dark:hover:bg-gray-600
                  text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600
                  hover:border-gray-300 dark:hover:border-gray-500 flex-shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </Link>
            )}

            <div className="relative flex items-center gap-3">
              <VideoActions
                video={video}
                user={user}
                onSend={send}
                cancelFn={cancelVideoBotUpload}
                reFetchFn={reFetch}
                detailsPath="/bot-videos"
                convertToMp4Fn={convertBotVideoToMp4}
                hidetails
              />

              {/* Download MP4 button - visible when temp_url exists and user is superadmin */}
              {user?.role === RoleEnum.SUPERADMIN &&
                (video.public_urls?.temp_url || video.s3_urls.hlsUrl) && (
                  <button
                    onClick={() =>
                      downloadAsMp4(
                        video.public_urls.temp_url || video.s3_urls.hlsUrl,
                        video?.ref
                          ? `${video.ref}.mp4`
                          : `video-${video.id}.mp4`
                      )
                    }
                    className="relative flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-all duration-300 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5L16.5 12M12 3v13.5"
                      />
                    </svg>
                    <span>Download MP4</span>
                  </button>
                )}
            </div>

            <Link
              to="/bot-videos"
              className="relative flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-all duration-300 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
            >
              Back to List
            </Link>

            {hasPrev && (
              <Link
                to={`/bot-videos/${prevVideo}`}
                className="relative flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-all duration-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex-shrink-0 min-w-[90px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </Link>
            )}

            {hasNext && (
              <Link
                to={`/bot-videos/${nextVideo}`}
                className="relative flex items-center justify-center gap-2 px-4 py-2 font-medium text-sm rounded-md transition-all duration-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex-shrink-0 min-w-[90px]"
              >
                Next
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Titles postTitles={video.titles as any} />
          </div>

          {video?.cdn_url && video?.s3_hls_path && (
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  CDN playback URL
                </h1>
                <a className="block w-full font-semibold text-blue-600 dark:text-blue-400 text-xs tracking-wide break-all overflow-hidden">
                  {video?.cdn_url + video?.s3_hls_path}
                </a>
              </div>
            )}

            {video?.cdn_url && video?.s3_cover_path && (
              <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-2 mt-5 transition-colors duration-300">
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  CDN Cover URL
                </h1>
                <a className="block w-full font-semibold text-blue-600 dark:text-blue-400 text-xs tracking-wide break-all overflow-hidden">
                  {video?.cdn_url + video?.s3_cover_path}
                </a>
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default VideoBotDetails;
