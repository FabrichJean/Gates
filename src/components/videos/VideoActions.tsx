import { Link } from "react-router-dom";
import RoleEnum from "../../utils/roleEnum";
import type { TVideo } from "../../hooks/useVideos";
import type { User } from "../../hooks/useVideos";

interface VideoActionsProps {
  video: TVideo;
  user: User;
  onSend: (videoId: number) => void;
}

const VideoActions = ({
  video,
  user,
  onSend,
}: VideoActionsProps) => {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {user?.role === RoleEnum.SUPERADMIN && (
        <button
          disabled={video.processing === 'working' || video.processing === 'done'}
          onClick={() => {
            if (video.checking !== 'checked') {
              return alert("We need to check this video")
            }
            onSend(video.id)
          }}
          className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2 font-medium text-sm rounded-md transition-all duration-300 ${video.processing === 'working'
            ? "cursor-not-allowed bg-gray-100 text-gray-500"
            : "cursor-pointer bg-white/90 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
            }`}
        >
          {video.processing === 'working' ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-md animate-spin" />
              <span>processing...</span>
            </>
          ) : video.upload_status === 1 && video.transfer_status === 1 ? (
            <span className="text-green-600 font-semibold flex gap-1 items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Uploaded
            </span>
          ) : (
            <span className="hover:text-blue-500 flex items-center gap-3 font-semibold">
              <span className="">
                🚀
              </span>
              <span className="">
                Send
              </span>
            </span>
          )}
        </button>
      )}

      <Link
        to={`/videos/${video.id}`}
        className="px-4 py-2 hover:bg-gray-100/10 cursor-pointer underline rounded-md font-light hover:text-blue-400 transition-all"
      >
        Details
      </Link>
    </div>
  );
};

export default VideoActions;