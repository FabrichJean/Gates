import { useEffect, useState } from "react";
// @ts-ignore
import io from "socket.io-client";
import { server } from "../constant";

export interface AudioUploadProgress {
  audioId: number;
  userId: number;
  status: string;
  progress: number; // 0-100
  entityType: string;
  [key: string]: any;
}

// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "";

export function useAudioUploadProgress() {
  const [progressMap, setProgressMap] = useState<Record<number, AudioUploadProgress>>({});

  useEffect(() => {
    if (!io) return;
    const socket = io(server);

    const handleProgress = (data: AudioUploadProgress) => {
      if (data.entityType === "audio") {
        setProgressMap((prev) => ({ ...prev, [data.audioId]: data }));
      }
    };

    socket.on("audio-upload-progress", handleProgress);

    return () => {
      socket.off("audio-upload-progress", handleProgress);
      socket.disconnect();
    };
  }, []);

  return progressMap;
}
