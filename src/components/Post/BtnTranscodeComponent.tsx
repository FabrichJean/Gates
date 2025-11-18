import { Loader2, CheckCircle } from "lucide-react";
import { type TPost } from "../../hooks/usePost";
import { cancelPostProcessing, usePostProcessing } from "../../api/posts";
import useSocketProcessing from "../../hooks/useSocketProcessing";
import { ImUpload } from "react-icons/im";


const BtnTranscodeComponent = ({
  post,
  reFetch,
}: {
  post: TPost;
  reFetch: () => void;
}) => {
  useSocketProcessing(reFetch, post.id);
  const handleTranscode = async () => {
    try {
      const processing = await usePostProcessing({ id: post.id });
      console.log("processing :", processing);

      reFetch();
    } catch (error) {
      console.error("Error transcoding post:", error);
    }
  };
  const handleCancelTranscode = async () => {
    try {
        await cancelPostProcessing({ id: post.id });

        reFetch();
    } catch (error) {
      console.error("Error transcoding post:", error);
    }
  };

  const isDisabled =
    post.processing === "working" || post.processing === "done";

  const getButtonStyles = () => {
    if (post.processing === "working") {
      return "bg-yellow-100/90 dark:bg-yellow-700/90 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-600 cursor-not-allowed";
    }
    if (post.processing === "done") {
      return "bg-green-100/90 dark:bg-green-700/90 text-green-800 dark:text-green-200 border-green-200 dark:border-green-600 cursor-not-allowed";
    }
    return "bg-purple-100/90 dark:bg-purple-700/90 hover:bg-purple-200 dark:hover:bg-purple-600 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-600 hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer";
  };

  const getIcon = () => {
    if (post.processing === "working") {
      return <Loader2 size={16} className="animate-spin" />;
    }
    if (post.processing === "done") {
      return <CheckCircle size={16} />;
    }
    return <ImUpload size={16} />;
  };


  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTranscode}
        disabled={isDisabled}
        className={`relative flex items-center justify-center p-2 rounded-md transition-all duration-300 backdrop-blur-md border focus:outline-none focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-500 ${getButtonStyles()}`}
        title={
          post?.processing === "working"
            ? "Transcoding in progress..."
            : post?.processing === "done"
            ? "Transcoding completed"
            : "Transcode video"
        }
      >
        {getIcon()}
      </button>
        {post.processing === "working" && (
            <button
            onClick={handleCancelTranscode}
            className="relative flex items-center justify-center p-2 rounded-md transition-all duration-300 backdrop-blur-md border focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500 bg-red-100/90 dark:bg-red-700/90 hover:bg-red-200 dark:hover:bg-red-600 text-red-800 dark:text-red-200 border-red-200 dark:border-red-600 hover:border-red-300 dark:hover:border-red-500 cursor-pointer"
            title="Cancel transcoding"
            >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            </button>
      )}
    </div>
  );
};
export default BtnTranscodeComponent;
