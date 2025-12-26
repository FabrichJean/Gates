import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { UseAppVideo, useNextAppVideo } from "../hooks/app/useAppVideos";
import { FaPlayCircle } from "react-icons/fa";
import { updateVideoForApp } from "../api/videoForApp";
import { useAuthMe } from "../hooks/useAuth";
import RoleEnum from "../utils/roleEnum";
import CheckingSuperadmin from "../components/CheckingSuperadmin";
import VideoActions from "../components/videos/VideoActions";
import useSocketSend from "../hooks/useSocketSend";

const VideoForAppDetails: React.FC = () => {
  const { data: user } = useAuthMe();
  const { id: routeId } = useParams<{ id: string }>();

  const { data: video, reFetch } = UseAppVideo(routeId);
  const { nextVideo, prevVideo, hasNext, hasPrev } = useNextAppVideo(routeId);

  const [videoPlayed, setVideoPlayed] = useState(false);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>();

  useEffect(() => {
    if (video) {
      setCurrentCoverUrl(
        (video?.cover || "https://placehold.co/600x400") + "?t=" + Date.now()
      );
    }
  }, [video]);

  useSocketSend(reFetch);

  if (!video)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">App Video not found</div>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 items-start justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 transition-all duration-300">
      <div className="w-full  bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6 transition-all duration-300">
        <div className="flex justify-between gap-4 items-center w-full">
          <div className="flex items-center gap-2">
            {video?.creatorObj?.avatar ? (
              <img
                src={video.creatorObj.avatar}
                alt={video.creatorObj.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                No
              </div>
            )}
            <Link
              className="hover:text-blue-500 font-medium"
              to={`/creators/${video?.creatorObj?.id}`}
            >
              {video?.creatorObj?.name ?? video.creator ?? "-"}
            </Link>
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">{video.cn_title}</h2>
          <div className="mb-2">EN: {video.en_title}</div>
          <div className="mb-2">HI: {video.hi_title}</div>
          <div className="mb-2">Seconds: {video.seconds}</div>
          {/* Add more fields as needed */}
        </div>
      </div>
    </div>
  );
};

export default VideoForAppDetails;
