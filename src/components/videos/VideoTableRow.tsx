/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiPlay, FiClock, FiCalendar } from "react-icons/fi";
import { FaCheck } from "react-icons/fa";
import CheckingSuperadmin from "../CheckingSuperadmin";
import VideoActions from "./VideoActions";
import RoleEnum from "../../utils/roleEnum";
import type { TVideo } from "../../hooks/useVideos";
import { useAuth } from "../../hooks/useAuth";

interface VideoTableRowProps {
  video: TVideo;
  index: number;
  onActivate: (videoId: number) => void;
  onSend: (videoId: number) => void;
  updateFn?: (id: number | string | undefined, payload: any) => Promise<any>;
  hideTouchLink?: boolean;
  cancelFn?: (videoId: number) => Promise<any>;
  reFetchFn?: (delay?: number) => void;
  detailsPath?: string;
  convertToMp4Fn?: (videoId: number) => Promise<any>;
  hideSend?: boolean;
}

const VideoTableRow = ({
  video,
  index,
  onActivate,
  onSend,
  updateFn,
  hideTouchLink,
  cancelFn,
  reFetchFn,
  detailsPath,
  convertToMp4Fn,
  hideSend,
}: VideoTableRowProps) => {
  const { user } = useAuth();

  const statusConfig = {
    uploaded: {
      label: "Uploadé",
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      icon: <FaCheck className="w-3 h-3" />
    },
    waiting_upload: {
      label: "En attente",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      icon: <FiClock className="w-3 h-3" />
    },
    waiting_transcode: {
      label: "Transcodage",
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      icon: <FiClock className="w-3 h-3" />
    }
  };

  const getStatus = () => {
    if (video.upload_status === 1) return statusConfig.uploaded;
    if (video.transfer_status === 1) return statusConfig.waiting_upload;
    return statusConfig.waiting_transcode;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 cursor-pointer"
    >
      {/* Référence */}
      <td className="py-4 px-6">
        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
          {video.ref}
        </span>
      </td>

      {/* Utilisateur */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <FiUser className="w-4 h-4 text-white" />
          </div>
          {user?.role === RoleEnum.SUPERADMIN ? (
            <Link
              to={`/users/${video.user?.id}`}
              className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              {video.user?.username}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {video.user?.username}
            </span>
          )}
        </div>
      </td>

      {/* Créateur */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          {video?.creatorObj?.avatar ? (
            <img
              src={video.creatorObj.avatar}
              alt={video.creatorObj.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {video.creatorObj?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <Link
            to={`/creators/${video?.creatorObj?.id}`}
            className="text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
          >
            {video?.creatorObj?.name ?? video.creator ?? 'Unknown'}
          </Link>
        </div>
      </td>

      {/* Catégorie */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {video.category?.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {video.subCategory?.name}
          </span>
        </div>
      </td>

      {/* Statut */}
      <td className="py-4 px-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatus().color}`}>
          {getStatus().icon}
          <span>{getStatus().label}</span>
        </div>
      </td>

      {/* Miniature */}
      <td className="py-4 px-6">
        <div className="relative group">
          <img
            src={video.s3_urls.coverUrl || video.public_urls?.local_cover_url || ''}
            alt="cover"
            className="w-24 h-14 object-cover rounded-lg shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <FiPlay className="w-5 h-5 text-white" />
          </div>
        </div>
      </td>

      {/* Durée */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FiClock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {formatDuration(Number(video.duration))}
          </span>
        </div>
      </td>

      {/* Statut Actif */}
      <td className="py-4 px-6">
        <input
          type="checkbox"
          checked={!video.isDeleted}
          className="toggle bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-blue-300 dark:checked:bg-blue-500 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300 w-[2.5rem] h-[1.5rem] scale-[0.7] rounded-full"
          onChange={
            user?.role === RoleEnum.SUPERADMIN
              ? () => onActivate(video.id)
              : undefined
          }
        />
      </td>

      {/* Superadmin Check */}
      <td className="py-4 px-6">
        <CheckingSuperadmin
          index={index}
          reFetch={() => window.dispatchEvent(new CustomEvent('request-videos-refetch', { detail: { delay: 500 } }))}
          video={video}
          user={user}
          updateFn={updateFn}
          hideTouchLink={hideTouchLink}
        />
      </td>

      {/* Actions */}
      <td className="py-4 px-6">
        <VideoActions
          video={video}
          user={user!}
          onSend={hideSend ? undefined : onSend}
          cancelFn={cancelFn}
          reFetchFn={reFetchFn}
          detailsPath={detailsPath}
          convertToMp4Fn={convertToMp4Fn}
        />
      </td>

      {/* Date */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FiCalendar className="w-4 h-4" />
          <span className="text-sm">
            {video.createdAt
              ? new Date(video.createdAt).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "-"}
          </span>
        </div>
      </td>
    </motion.tr>
  );
};

export default VideoTableRow;