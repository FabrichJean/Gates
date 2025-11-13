import { Link } from "react-router-dom";
import RoleEnum from "../../utils/roleEnum";
import type { TVideo } from "../../hooks/useVideos";
import type { User } from "../../hooks/useVideos";
import { cancelUpload } from "../../api/videos";
import toast from "react-hot-toast";
import AnimatedAlert from "../AnimatedAlert";
import { useAnimatedAlert, createQuickAlert } from "../../hooks/useAnimatedAlert";
import { useProcessingCount } from "./useProcessingCount";
import { useState } from "react";

interface VideoActionsProps {
  video: TVideo;
  user: User | Partial<User>;
  reFetch: () => void;
  onSend: (videoId: number) => void;
}

const VideoActions = ({
  video,
  user,
  reFetch,
  onSend,
}: VideoActionsProps) => {

  const { showAlert, alertProps } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);
  const { count: processingCount } = useProcessingCount();

  const cancel = async () => {
    await cancelUpload(video.id)
      .then(reFetch)
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      })
  }

  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (resending) return;
    setResending(true);
    try {
      // first cancel the current processing
      await cancelUpload(video.id);
      // then immediately send again
      onSend(video.id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error during resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <AnimatedAlert {...alertProps} />
      <div className="flex justify-center gap-2 flex-wrap">
        {user?.role === RoleEnum.SUPERADMIN && (
        <div className="relative flex items-center gap-3">
          <button
            disabled={video.processing === 'working' || video.processing === 'done'}
            onClick={() => {
              if (video.checking !== 'checked') {
                return alert.warning("We need to check this video", "Video Check Required");
              }
              if (processingCount >= 5) {
                toast.error("The maximum number of videos in process (5) has been reached. Please wait until a video finishes processing before sending another.");
                return;
              }
              onSend(video.id);
            }}
            className={`relative flex w-[150px] items-center justify-center gap-2 px-6 py-2.5 font-medium hover:text-blue-500 text-sm rounded-md transition-all duration-300 ${video.processing === 'working' || (video.upload_status === 1 && video.transfer_status === 1)
              ? "cursor-not-allowed bg-gray-100 dark:bg-gray-100/10 text-gray-500"
              : "cursor-pointer bg-transparent hover:bg-white text-gray-700 dark:text-gray-100 border border-blue-300 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              }`}
          >
            {video.processing === 'working' ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : video.upload_status === 1 && video.transfer_status === 1 ? (
              <span className="text-green-600 font-semibold flex gap-1 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                Uploaded
              </span>
            ) : (
              <span className="hover:text-blue-500 flex gap-3 items-center">
                <span>
                  🚀
                </span>
                <span>
                  Send
                </span>
              </span>
            )}
          </button>

          {/* --- BOUTON ANNULER --- */}
          {video.processing === 'working' && (
            <button
              onClick={cancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-md transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          )}
          {video.processing === 'working' && (
            <button
              onClick={resend}
              disabled={resending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl shadow-md transition-all duration-200"
            >
              {resending ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-9-9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 3v6h-6" />
                </svg>
              )}
              <span>{resending ? 'Resending...' : 'Resend'}</span>
            </button>
          )}
        </div>
      )}


        <Link
          to={`/videos/${video.id}`}
          className="px-4 py-2 hover:bg-gray-100/10 cursor-pointer underline rounded-md font-light hover:text-blue-400 transition-all"
        >
          Details
        </Link>
      </div>
    </>
  );
};

export default VideoActions;