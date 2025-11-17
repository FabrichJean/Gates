/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link } from "react-router-dom";
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
}: VideoTableRowProps) => {

  const {user} = useAuth()
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
      <td className="py-3 px-6 font-light text-gray-800 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800">{video.ref}</td>
      <td className="py-3 px-6 text-blue-600 dark:text-blue-400 underline border-r border-gray-100 dark:border-gray-800">
        {user?.role === RoleEnum.SUPERADMIN ? (
          <Link
            to={`/users/${video.user?.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-300"
          >
            {video.user?.username}
          </Link>
        ) : (
          video.user?.username
        )}
      </td>

      <td className="py-3 px-6 font-light text-gray-800 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {(video?.creatorObj?.avatar) ? (
            <img src={video?.creatorObj.avatar} alt={video?.creatorObj.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500">No</div>
          )}
          <div>{(video)?.creatorObj?.name ?? video.creator ?? '-'}</div>
        </div>
      </td>

      <td className="py-3 px-6 font-light text-gray-800 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800">
        {video.category?.name} / {video.subCategory?.name}
      </td>

      <td className="py-3 px-6 border-r border-gray-100 dark:border-gray-800">
        {video.upload_status === 1 ? (
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300">
            uploaded
          </span>
        ) : video.transfer_status === 1 ? (
          <span className="bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300">
            waiting for Upload
          </span>
        ) : (
          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300">
            waiting for Transcode
          </span>
        )}
      </td>

      <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
        <img
          src={`${video.public_urls?.cover_url || video.s3_urls?.coverUrl || ''}`}
          alt="cover"
          className="w-20 h-12 object-cover rounded-lg mx-auto border border-gray-200 dark:border-gray-600 shadow-sm"
        />
      </td>

      <td className="py-3 px-6 text-center font-light text-gray-800 dark:text-gray-300 border-r border-gray-100 dark:border-gray-800">
        {(Number(video.duration) / 1000).toFixed()} s
      </td>

      <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
        <input
          type="checkbox"
          checked={!video.isDeleted}
          className="toggle toggle-primary bg-gray-200 dark:bg-gray-600 border-gray-300 dark:border-gray-500 checked:bg-gray-300 dark:checked:bg-blue-300/20 checked:border-gray-300 dark:checked:border-gray-700 transition-colors duration-300"
          onChange={
            user?.role === RoleEnum.SUPERADMIN
              ? () => onActivate(video.id)
              : undefined
          }
        />
      </td>

      <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
        {/* Pass a wrapper that requests a debounced list refresh instead of the raw reFetch
            This avoids child components directly triggering immediate /videos reFetch storms.
        */}
        <CheckingSuperadmin
          index={index}
          reFetch={() => window.dispatchEvent(new CustomEvent('request-videos-refetch', { detail: { delay: 500 } }))}
          video={video}
          user={user}
          updateFn={updateFn}
          hideTouchLink={hideTouchLink}
        />
      </td>

      <td className="py-3 px-6 text-center border-r border-gray-100 dark:border-gray-800">
        <VideoActions
          video={video}
          user={user!}
          onSend={onSend}
          cancelFn={cancelFn}
          reFetchFn={reFetchFn}
          detailsPath={detailsPath}
          convertToMp4Fn={convertToMp4Fn}
        />
      </td>

      <td className="py-3 px-6 text-center font-light text-gray-800 dark:text-gray-300">
        {video.createdAt ? new Date(video.createdAt).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }) : ''}
      </td>
    </tr>
  );
};

export default VideoTableRow;