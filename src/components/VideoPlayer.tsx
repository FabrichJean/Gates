import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactHlsPlayer from 'react-hls-player';
import { Play, Loader2 } from 'lucide-react';
import { useVideoPlayer, type VideoUrls } from '../hooks/useVideoPlayer';

export interface VideoPlayerProps {
  videoUrls?: VideoUrls;
  poster?: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  className?: string;
  showVipBadge?: boolean;
  autoPlay?: boolean;
  isForApp?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrls,
  poster,
  isPlaying = true, // Default to true for VideoForApp
  onPlay,
  className = "w-full h-full",
  showVipBadge = false,
  autoPlay = true,
  isForApp = false
}) => {
  const { videoSrc, isLoading, isHls, error, playerRef } = useVideoPlayer({
    videoUrls,
    autoPlay,
    poster,
    isForApp
  });

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const el = e.currentTarget;
    el.style.objectFit = "cover";
    el.style.objectPosition = "center";
  };

  // For VideoForApp: skip play button and go directly to video playback
  if (isForApp) {
    // Continue to video loading/rendering logic below
  }
  // For interactive videos: show play button when not playing
  else if (!isPlaying && onPlay) {
    return (
      <div className={`relative ${className}`}>
        {/* Play Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        </motion.div>

        {/* VIP Badge */}
        {showVipBadge && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-2 top-2 z-20"
          >
            <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <span className="text-orange-400 font-bold text-sm">VIP</span>
            </div>
          </motion.div>
        )}

        {/* Cover Image */}
        {poster && (
          <img
            src={poster}
            alt="cover"
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        key="loading-video"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`flex items-center justify-center bg-black ${className}`}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <div className="text-white text-sm">Loading video...</div>
        </div>
      </motion.div>
    );
  }

  if (error && !videoSrc) {
    return (
      <motion.div
        key="error-video"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`flex items-center justify-center bg-black ${className}`}
      >
        <div className="text-center text-white">
          <div className="text-red-400 mb-2">⚠️ Error loading video</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  if (!videoSrc) {
    return (
      <motion.div
        key="no-video"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`flex items-center justify-center bg-black ${className}`}
      >
        <div className="text-white">No video source available</div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {isHls ? (
        <motion.div
          key="hls-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={className}
        >
          <ReactHlsPlayer
            playerRef={playerRef}
            src={videoSrc}
            autoPlay={autoPlay}
            controls={true}
            width="100%"
            height="auto"
            poster={poster}
            onLoadedMetadata={handleLoadedMetadata}
          />
        </motion.div>
      ) : (
        <motion.video
          key="direct-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          src={videoSrc}
          className={`${className} object-cover`}
          controls
          autoPlay={autoPlay}
          playsInline
          poster={poster}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}
    </AnimatePresence>
  );
};

export default VideoPlayer;