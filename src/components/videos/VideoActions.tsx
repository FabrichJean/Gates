import { Link } from "react-router-dom";
import RoleEnum from "../../utils/roleEnum";
import type { TVideo } from "../../hooks/useVideos";
import type { User } from "../../hooks/useVideos";
import { cancelUpload } from "../../api/videos";
import toast from "react-hot-toast";
import { useAnimatedAlert, createQuickAlert } from "../../hooks/useAnimatedAlert";
import { useProcessingCount } from "../useProcessingCount";
import { useState } from "react";
import { useVideosContext } from "../../context/VideosContext";

interface VideoActionsProps {
  video: TVideo;
  user: User | Partial<User> | null;
  onSend: (videoId: number) => void;
  /** Optional cancel function for custom API (e.g. bot videos) */
  cancelFn?: (videoId: number) => Promise<any>;
  /** Optional refetch function for custom context */
  reFetchFn?: (delay?: number) => void;
  /** Optional base path for details link (default: "/videos") */
  detailsPath?: string;
  /** Optional convert to mp4 function (for bot videos) */
  convertToMp4Fn?: (videoId: number) => Promise<any>;
}

const VideoActions = ({
  video,
  user,
  onSend,
  cancelFn,
  reFetchFn,
  detailsPath = "/videos",
  convertToMp4Fn,
}: VideoActionsProps) => {

  const { showAlert } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);
  const { count: processingCount } = useProcessingCount();
  // // use videos context for debounced refresh
  const ctx = useVideosContext();

  // Use custom refetch if provided, otherwise fall back to context
  const refetch = reFetchFn || ctx?.reFetch;

  const extractErrorMessage = (err: unknown) => {
    try {
      if (!err) return 'Error';
      if (typeof err === 'string') return err;
      if (typeof err === 'object' && err !== null) {
        // try common axios shape
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (err as any)?.response?.data?.message ?? (err as any)?.message ?? 'Error';
      }
      return String(err);
    } catch {
      return 'Error';
    }
  };

  const cancel = async () => {
    try {
      // Use custom cancel function if provided, otherwise use default
      if (cancelFn) {
        await cancelFn(video.id);
      } else {
        await cancelUpload(video.id);
      }
      // request a debounced list refresh
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const [resending, setResending] = useState(false);

  const resend = async () => {
    if (resending) return;
    setResending(true);
    try {
      // first cancel the current processing
      if (cancelFn) {
        await cancelFn(video.id);
      } else {
        await cancelUpload(video.id);
      }
      // then immediately send again
      onSend(video.id);
      // schedule a debounced refresh
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err) || 'Error during resend');
    } finally {
      setResending(false);
    }
  };

  const [converting, setConverting] = useState(false);

  const convertToMp4 = async () => {
    if (!convertToMp4Fn) return;
    if (converting) return;
    setConverting(true);
    try {
      await convertToMp4Fn(video.id);
      toast.success("✅ Conversion MP4 démarrée !");
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err) || 'Erreur lors de la conversion');
    } finally {
      setConverting(false);
    }
  };

  return (
    <>
      {/* <AnimatedAlert {...alertProps} /> */}
      <div className="flex justify-center gap-2 flex-wrap">
        {user?.role === RoleEnum.SUPERADMIN && (
        <div className="relative flex items-center gap-3">
          {(!convertToMp4Fn || video.public_urls?.temp_url) && (
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
          )}

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
          
          {/* Convert to MP4 button (only for bot videos) */}
          {(convertToMp4Fn && !video.public_urls?.temp_url) && (
            <button
              onClick={convertToMp4}
              disabled={converting}
              className="relative flex items-center justify-center gap-2 px-6 py-2.5 font-medium text-sm rounded-md transition-all duration-300 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed "
            >
              {converting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              )}
              <span>{converting ? 'Converting...' : 'Convert MP4'}</span>
            </button>
          )}
        </div>
      )}


        <Link
          to={`${detailsPath}/${video.id}`}
          className="px-4 py-2 hover:bg-gray-100/10 cursor-pointer underline rounded-md font-light hover:text-blue-400 transition-all"
        >
          Details
        </Link>
      </div>
    </>
  );
};

export default VideoActions;