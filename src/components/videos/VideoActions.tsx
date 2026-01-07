import { Link } from "react-router-dom";
import RoleEnum from "../../utils/roleEnum";
import type { TVideo } from "../../hooks/useVideos";
import type { User } from "../../hooks/useVideos";
import { cancelUpload, singleSync } from "../../api/videos";
import SingleSyncModal from "../SingleSyncModal";
import toast from "react-hot-toast";
import {
  useAnimatedAlert,
  createQuickAlert,
} from "../../hooks/useAnimatedAlert";
import { useProcessingCount } from "../useProcessingCount";
import { useState } from "react";
import { useVideosContext } from "../../context/VideosContext";
import { useProgressStore } from "../../hooks/useProgressStore";

import { LiaSyncSolid } from "react-icons/lia";

interface VideoActionsProps {
  video: TVideo;
  user: User | Partial<User> | null;
  onSend: (videoId: number) => void;
  cancelFn?: (videoId: number) => Promise<any>;
  reFetchFn?: (delay?: number) => void;
  detailsPath?: string;
  convertToMp4Fn?: (videoId: number) => Promise<any>;
  hidetails?: boolean;
}

const VideoActions = ({
  video,
  user,
  onSend,
  cancelFn,
  reFetchFn,
  hidetails,
  detailsPath = "/videos",
  convertToMp4Fn,
}: VideoActionsProps) => {
  const { uploads } = useProgressStore()
  const { showAlert } = useAnimatedAlert();
  const alert = createQuickAlert(showAlert);
  const { count: processingCount } = useProcessingCount();
  // Only use VideosContext if reFetchFn is not provided
  const ctx = reFetchFn ? null : useVideosContext();
  const refetch = reFetchFn || ctx?.reFetch;

  const [resending, setResending] = useState(false);
  const [converting, setConverting] = useState(false);

  // SingleSync modal state
  const [singleSyncOpen, setSingleSyncOpen] = useState(false);
  const [singleSyncLoading, setSingleSyncLoading] = useState(false);



  const extractErrorMessage = (err: unknown) => {
    try {
      if (!err) return "Error";
      if (typeof err === "string") return err;
      if (typeof err === "object" && err !== null) {
        return (
          (err as any)?.response?.data?.message ??
          (err as any)?.message ??
          "Error"
        );
      }
      return String(err);
    } catch {
      return "Error";
    }
  };

  const handleSingleSync = async (isForce: boolean) => {
    setSingleSyncLoading(true);
    try {
      await singleSync({ entity: "video", origin_id: video.id, isForce });
      toast.success("✅ Sync single exécuté");
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "❌ Erreur sync single !");
    } finally {
      setSingleSyncLoading(false);
    }
  };

  const cancel = async () => {
    try {
      if (cancelFn) {
        await cancelFn(video.id);
      } else {
        await cancelUpload(video.id);
      }
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    try {
      if (cancelFn) {
        await cancelFn(video.id);
      } else {
        await cancelUpload(video.id);
      }
      onSend(video.id);
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "Error during resend");
    } finally {
      setResending(false);
    }
  };

  const convertToMp4 = async () => {
    if (!convertToMp4Fn) return;
    if (converting) return;
    setConverting(true);
    try {
      await convertToMp4Fn(video.id);
      toast.success("✅ Conversion MP4 démarrée !");
      refetch?.(500);
    } catch (err) {
      toast.error(extractErrorMessage(err) || "Erreur lors de la conversion");
    } finally {
      setConverting(false);
    }
  };

  const isProcessing = video.processing === "working";
  const isDone = video.processing === "done";
  const isDisabled = isProcessing || isDone;

  return (
    <div className="flex items-center justify-center gap-2">
      {user?.role === RoleEnum.SUPERADMIN && onSend && (
        <>
          {/* Main Action Button - Send or Status */}
          {!isProcessing && (
            <button
              disabled={isDisabled}
              onClick={() => {
                if (video.checking !== "checked") {
                  return alert.warning(
                    "We need to check this video",
                    "Video Check Required"
                  );
                }
                if (processingCount >= 5) {
                  toast.error(
                    "Maximum 5 videos in process. Please wait."
                  );
                  return;
                }
                onSend(video.id);
              }}
              className={`
                inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                text-sm font-medium transition-all duration-200
                ${isDone
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : isDisabled
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700"
                }
              `}
            >
              {isDone ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Uploaded</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          )}

          {/* Processing State with Cancel & Resend */}
          {isProcessing && (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm font-medium">Processing ({uploads.find(v => Number(v.videoId) === Number(video.id))?.progress || 0}%)</span>
              </div>

              <button
                onClick={cancel}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <button
                onClick={resend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 disabled:opacity-50"
                title="Resend"
              >
                {resending ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </>
          )}

          {/* Convert to MP4 Button */}
          {convertToMp4Fn && !video.public_urls?.temp_url && (
            <button
              onClick={convertToMp4}
              disabled={converting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {converting ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{converting ? "Converting..." : "Convert MP4"}</span>
            </button>
          )}
        </>
      )}


      {/* bouton single sync */}
      {user?.role === RoleEnum.SUPERADMIN && (
        <>
          <button
            type="button"
            onClick={() => setSingleSyncOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 text-sm font-medium transition-all duration-200"
            disabled={singleSyncLoading}
          >
            <LiaSyncSolid className="w-4 h-4" />
            Sync
          </button>
          <SingleSyncModal
            open={singleSyncOpen}
            onClose={() => setSingleSyncOpen(false)}
            onSubmit={handleSingleSync}
            title="Synchroniser cette vidéo"
          />
        </>
      )}


      {/* Details Link */}
      {!hidetails && (
        <Link
          to={`${detailsPath}/${video.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Details</span>
        </Link>
      )}
    </div>
  );
};

export default VideoActions;