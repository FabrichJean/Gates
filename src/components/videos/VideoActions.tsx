import { Link } from "react-router-dom";
import RoleEnum from "../../utils/roleEnum";
import type { Video } from "../../types/video";

interface VideoActionsProps {
  video: Video;
  user: any;
  isProcessing: boolean;
  sendingIds: number[];
  onSend: (videoId: number) => void;
}

const VideoActions = ({
  video,
  user,
  isProcessing,
  sendingIds,
  onSend,
}: VideoActionsProps) => {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {user?.role === RoleEnum.SUPERADMIN && (
        <button
          disabled={isProcessing}
          onClick={() => {
            if (video.checking !== 'checked') {
              return alert("We need to check this video")
            }
            onSend(video.id)
          }}
          className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm rounded-xl transition-all duration-300 ${isProcessing
            ? "cursor-not-allowed bg-gray-100 text-gray-500"
            : "cursor-pointer bg-white/90 hover:bg-white text-gray-800 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            }`}
        >
          {sendingIds.includes(video.id) ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
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
            <span className="underline hover:text-blue-500">🚀 Send</span>
          )}
        </button>
      )}

      <Link
        to={`/videos/${video.id}`}
        className="px-4 py-2 hover:bg-gray-100 cursor-pointer underline font-light hover:text-blue-400 transition-all"
      >
        Details
      </Link>
    </div>
  );
};

export default VideoActions;