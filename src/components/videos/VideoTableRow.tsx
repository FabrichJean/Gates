/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Link } from "react-router-dom";
import CheckingSuperadmin from "../CheckingSuperadmin";
import VideoActions from "./VideoActions";
import RoleEnum from "../../utils/roleEnum";
import type { TVideo } from "../../hooks/useVideos";
import type { User } from "../../hooks/useVideos";

interface VideoTableRowProps {
  video: TVideo;
  index: number;
  user: User | Partial<User>;
  onActivate: (videoId: number) => void;
  onSend: (videoId: number) => void;
  reFetch: () => void;
}

const VideoTableRow = ({
  video,
  index,
  user,
  onActivate,
  onSend,
  reFetch,
}: VideoTableRowProps) => {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="py-3 px-6 font-light">{video.ref}</td>
      <td className="py-3 px-6 text-blue-600 underline">
        {user?.role === RoleEnum.SUPERADMIN ? (
          <Link
            to={`/users/${video.user?.id}`}
            className="text-blue-600 hover:underline"
          >
            {video.user?.username}
          </Link>
        ) : (
          video.user?.username
        )}
      </td>

      <td className="py-3 px-6 font-light">
        {video.category?.name} / {video.subCategory?.name}
      </td>

      <td className="py-3 px-6">
        {video.upload_status === 1 ? (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
            uploaded
          </span>
        ) : video.transfer_status === 1 ? (
          <span className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-semibold">
            waiting for Upload
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
            waiting for Transcode
          </span>
        )}
      </td>

      <td className="py-3 px-6 text-center">
        <img
          src={`${video.public_urls?.cover_url || ''}`}
          alt="cover"
          className="w-20 h-12 object-cover rounded-lg mx-auto"
        />
      </td>

      <td className="py-3 px-6 text-center font-light">
        {(Number(video.duration) / 1000).toFixed()} s
      </td>

      <td className="py-3 px-6 text-center">
        <input
          type="checkbox"
          checked={!video.isDeleted}
          className="toggle"
          onChange={
            user?.role === RoleEnum.SUPERADMIN
              ? () => onActivate(video.id)
              : undefined
          }
        />
      </td>

      <td className="py-3 px-6 text-center">
        {/* @ts-ignore */}
        <CheckingSuperadmin index={index} reFetch={reFetch} video={video} user={user} />
      </td>

      <td className="py-3 px-6 text-center">
        <VideoActions
          video={video}
          user={user}
          onSend={onSend}
          reFetch={reFetch}
        />
      </td>

      <td className="py-3 px-6 text-center font-light">
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