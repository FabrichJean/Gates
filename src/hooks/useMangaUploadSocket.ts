import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";

// Singleton socket instance with auto-reconnect
let globalSocket: Socket | null = null;
let socketInitialized = false;

function getOrCreateSocket(): Socket {
  if (!globalSocket || !globalSocket.connected) {
    console.log("🔌 Creating/Reconnecting Socket.IO connection...");
    
    if (globalSocket) {
      globalSocket.disconnect();
    }
    
    globalSocket = io(server, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    globalSocket.on("connect", () => {
      console.log("🟢 Socket.IO connected:", globalSocket?.id);
      socketInitialized = true;
    });

    globalSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket.IO disconnected:", reason);
      socketInitialized = false;
    });

    globalSocket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error);
    });

    globalSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket.IO reconnected after", attemptNumber, "attempts");
    });
  }
  
  return globalSocket;
}

// LocalStorage keys
const MANGA_UPLOAD_PREFIX = "manga_upload_";

export interface MangaUploadProgress {
  userId: number;
  mangaId: number;
  type?: 'cover' | 'episode';
  chapterId?: number;
  episodeId?: number;
  episodeName?: string;
  coverUrl?: string;
  episodeUploadedImages?: number;
  episodeTotalImages?: number;
  progress: number;
  uploadedImages: number;
  totalImages: number;
  message?: string;
}

export interface MangaUploadComplete {
  userId: number;
  mangaId: number;
  message: string;
  progress: number;
  results: any;
}

export interface MangaUploadError {
  userId: number;
  mangaId: number;
  error: string;
  progress: number;
}

export interface MangaUploadState {
  isUploading: boolean;
  progress: number;
  currentTask: string;
  lastUpdated: number;
}

// Helper functions for localStorage
export function getMangaUploadState(mangaId: number): MangaUploadState | null {
  try {
    const data = localStorage.getItem(`${MANGA_UPLOAD_PREFIX}${mangaId}`);
    if (!data) return null;
    const state = JSON.parse(data) as MangaUploadState;
    
    // If last update was more than 1 hour ago, consider it stale
    if (Date.now() - state.lastUpdated > 3600000) {
      localStorage.removeItem(`${MANGA_UPLOAD_PREFIX}${mangaId}`);
      return null;
    }
    
    // If stuck at same progress for more than 5 minutes, consider it failed
    if (state.isUploading && Date.now() - state.lastUpdated > 300000) {
      console.warn(`Upload state for manga ${mangaId} seems stuck, clearing...`);
      localStorage.removeItem(`${MANGA_UPLOAD_PREFIX}${mangaId}`);
      return null;
    }
    
    return state;
  } catch {
    return null;
  }
}

export function setMangaUploadState(mangaId: number, state: Partial<MangaUploadState>) {
  try {
    const current = getMangaUploadState(mangaId) || {
      isUploading: false,
      progress: 0,
      currentTask: "",
      lastUpdated: Date.now(),
    };
    
    const newState: MangaUploadState = {
      ...current,
      ...state,
      lastUpdated: Date.now(),
    };
    
    localStorage.setItem(`${MANGA_UPLOAD_PREFIX}${mangaId}`, JSON.stringify(newState));
  } catch (error) {
    console.error("Failed to save manga upload state:", error);
  }
}

export function clearMangaUploadState(mangaId: number) {
  try {
    localStorage.removeItem(`${MANGA_UPLOAD_PREFIX}${mangaId}`);
  } catch (error) {
    console.error("Failed to clear manga upload state:", error);
  }
}

// Clear all manga upload states (useful for cleanup)
export function clearAllMangaUploadStates() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(MANGA_UPLOAD_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to clear all manga upload states:", error);
  }
}

// Force reset a stuck upload
export function forceResetMangaUpload(mangaId: number) {
  console.log(`Force resetting upload for manga ${mangaId}`);
  clearMangaUploadState(mangaId);
}

export function useMangaUploadSocket(
  userId: number | null,
  mangaId: number,
  onProgress?: (data: MangaUploadProgress) => void,
  onComplete?: (data: MangaUploadComplete) => void,
  onError?: (data: MangaUploadError) => void
) {
  // Initialize from localStorage
  const savedState = getMangaUploadState(mangaId);
  const [isUploading, setIsUploading] = useState(savedState?.isUploading || false);
  const [progress, setProgress] = useState(savedState?.progress || 0);
  const [currentTask, setCurrentTask] = useState<string>(savedState?.currentTask || "");

  // Update state and localStorage
  const updateState = (updates: Partial<MangaUploadState>) => {
    if (updates.isUploading !== undefined) setIsUploading(updates.isUploading);
    if (updates.progress !== undefined) setProgress(updates.progress);
    if (updates.currentTask !== undefined) setCurrentTask(updates.currentTask);
    
    setMangaUploadState(mangaId, updates);
  };

  useEffect(() => {
    if (!userId) return;

    // Get or create socket connection (with auto-reconnect)
    const socket = getOrCreateSocket();

    // Handler for upload start
    const handleUploadStart = (data: MangaUploadProgress) => {
      if (data.userId !== userId || data.mangaId !== mangaId) return;
      
      console.log("📤 Manga upload started:", data);
      updateState({
        isUploading: true,
        progress: 0,
        currentTask: data.message || "Upload started...",
      });
    };

    // Handler for upload progress
    const handleUploadProgress = (data: MangaUploadProgress) => {
      if (data.userId !== userId || data.mangaId !== mangaId) return;
      
      console.log("📊 Manga upload progress:", data);
      
      let task = "";
      if (data.type === 'cover') {
        task = `Uploading cover (${data.uploadedImages}/${data.totalImages})`;
      } else if (data.type === 'episode') {
        task = `Uploading ${data.episodeName} (${data.episodeUploadedImages}/${data.episodeTotalImages} images) - Overall: ${data.uploadedImages}/${data.totalImages}`;
      }
      
      updateState({
        progress: data.progress,
        currentTask: task,
        isUploading: true,
      });
      
      if (onProgress) onProgress(data);
    };

    // Handler for upload complete
    const handleUploadComplete = (data: MangaUploadComplete) => {
      if (data.userId !== userId || data.mangaId !== mangaId) return;
      
      console.log("✅ Manga upload complete:", data);
      updateState({
        isUploading: false,
        progress: 100,
        currentTask: data.message || "Upload completed!",
      });
      
      if (onComplete) onComplete(data);
      
      // Clear localStorage after 5 seconds
      setTimeout(() => {
        clearMangaUploadState(mangaId);
        updateState({
          progress: 0,
          currentTask: "",
          isUploading: false,
        });
      }, 5000);
    };

    // Handler for upload error
    const handleUploadError = (data: MangaUploadError) => {
      if (data.userId !== userId || data.mangaId !== mangaId) return;
      
      console.error("❌ Manga upload error:", data);
      
      // Reset state immediately
      updateState({
        isUploading: false,
        progress: 0,
        currentTask: "",
      });
      
      // Clear localStorage immediately on error
      clearMangaUploadState(mangaId);
      
      if (onError) onError(data);
    };

    // Register event listeners
    socket.on("manga:upload:start", handleUploadStart);
    socket.on("manga:upload:progress", handleUploadProgress);
    socket.on("manga:upload:complete", handleUploadComplete);
    socket.on("manga:upload:error", handleUploadError);

    // Cleanup on unmount
    return () => {
      socket.off("manga:upload:start", handleUploadStart);
      socket.off("manga:upload:progress", handleUploadProgress);
      socket.off("manga:upload:complete", handleUploadComplete);
      socket.off("manga:upload:error", handleUploadError);
    };
  }, [userId, mangaId, onProgress, onComplete, onError]);

  return {
    isUploading,
    progress,
    currentTask,
  };
}
