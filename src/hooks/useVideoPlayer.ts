import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiURL, token } from '../constant';

export interface VideoUrls {
  hlsUrl?: string;
  temp_url?: string;
  coverUrl?: string;
  cover_url?: string;
}

export interface UseVideoPlayerOptions {
  videoUrls?: VideoUrls;
  autoPlay?: boolean;
  poster?: string;
  isForApp: boolean;
}

export interface UseVideoPlayerReturn {
  videoSrc: string | null;
  isLoading: boolean;
  isHls: boolean;
  error: string | null;
  playerRef: React.RefObject<HTMLVideoElement>;
  retry: () => void;
}

export const useVideoPlayer = ({
  videoUrls,
  autoPlay = true,
  poster,
  isForApp
}: UseVideoPlayerOptions): UseVideoPlayerReturn => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLVideoElement>(null);

  const isHls = videoSrc ? videoSrc.startsWith('blob:') : false;

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, []);

  const fetchVideoSrc = async () => {
    if (!videoUrls) return;

    setIsLoading(true);
    setError(null);

    try {
      if (videoUrls.hlsUrl) {
        // Fetch HLS content as blob
        const response = await axios.get(`${apiURL}/videos${isForApp ? "-for-app" : ""}/play`, {
          headers: {
            "Authorization": `Bearer ${token()}`
          },
          params: {
            key: 'xokey',
            url: videoUrls.hlsUrl
          },
          responseType: 'blob'
        });

        const hlsUrl = URL.createObjectURL(response.data);
        setVideoSrc(hlsUrl);
      } else if (videoUrls.temp_url) {
        // Use direct video URL
        setVideoSrc(videoUrls.temp_url);
      }
    } catch (err) {
      console.error('Failed to load video', err);
      setError('Failed to load video');

      // Fallback to direct URL if HLS fails
      if (videoUrls.hlsUrl) {
        // setVideoSrc(`${apiURL}/videos/play?key=xokey&url=${videoUrls.hlsUrl}`);
      } else if (videoUrls.temp_url) {
        setVideoSrc(videoUrls.temp_url);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retry = () => {
    fetchVideoSrc();
  };

  // Fetch video source when videoUrls change
  useEffect(() => {
    fetchVideoSrc();

    // Cleanup when videoUrls change
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoUrls?.hlsUrl, videoUrls?.temp_url]);

  return {
    videoSrc,
    isLoading,
    isHls,
    error,
    playerRef,
    retry,
  };
};