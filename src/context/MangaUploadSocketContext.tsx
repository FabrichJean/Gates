import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { getMangaUploadState, setMangaUploadState, clearMangaUploadState } from "../hooks/useMangaUploadSocket";
import type { MangaUploadState, MangaUploadProgress, MangaUploadComplete, MangaUploadError } from "../hooks/useMangaUploadSocket";

interface MangaCallbacks {
  onProgress?: (data: MangaUploadProgress) => void;
  onComplete?: (data: MangaUploadComplete) => void;
  onError?: (data: MangaUploadError) => void;
}

interface MangaUploadSocketContextType {
  socket: Socket | null;
  states: Record<number, MangaUploadState>;
  subscribe: (mangaId: number, callbacks?: MangaCallbacks) => void;
  unsubscribe: (mangaId: number) => void;
}

const MangaUploadSocketContext = createContext<MangaUploadSocketContextType | undefined>(undefined);

export const MangaUploadSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [states, setStates] = useState<Record<number, MangaUploadState>>({});
  const [subscribers, setSubscribers] = useState<Set<number>>(new Set());
  const callbacksRef = useRef<Record<number, MangaCallbacks>>({});

  // Initialize socket once
  useEffect(() => {
    console.log("🔌 Initializing global manga upload socket...");
    
    const newSocket = io(server, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });

    newSocket.on("connect", () => {
      console.log("🟢 Global manga upload socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Global manga upload socket disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Global manga upload socket error:", error);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Global manga upload socket reconnected after", attemptNumber, "attempts");
      // Reload all states from localStorage after reconnection
      loadAllStates();
    });

    // Listen to all manga upload events with specific handlers
    newSocket.on("manga:upload:start", handleUploadStart);
    newSocket.on("manga:upload:progress", handleUploadProgress);
    newSocket.on("manga:upload:complete", handleUploadComplete);
    newSocket.on("manga:upload:error", handleUploadError);

    setSocket(newSocket);

    // Load initial states from localStorage
    loadAllStates();

    return () => {
      console.log("🔌 Disconnecting global manga upload socket...");
      newSocket.disconnect();
    };
  }, []);

  // Load all states from localStorage
  const loadAllStates = useCallback(() => {
    const newStates: Record<number, MangaUploadState> = {};
    
    // Scan localStorage for all manga upload states
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('manga_upload_')) {
        const mangaId = parseInt(key.replace('manga_upload_', ''));
        if (!isNaN(mangaId)) {
          const state = getMangaUploadState(mangaId);
          if (state && state.isUploading) {
            newStates[mangaId] = state;
          }
        }
      }
    }
    
    setStates(newStates);
  }, []);

  // Handle upload start event
  const handleUploadStart = useCallback((data: MangaUploadProgress) => {
    console.log("📤 Context received upload:start event:", data);
    const mangaId = data.mangaId;
    if (mangaId) {
      // Update localStorage
      setMangaUploadState(mangaId, {
        isUploading: true,
        progress: 0,
        currentTask: data.message || "Upload started...",
        lastUpdated: Date.now()
      });
      
      const state = getMangaUploadState(mangaId);
      console.log("📤 Upload start state from localStorage:", state);
      if (state) {
        setStates(prev => {
          const newStates = { ...prev, [mangaId]: state };
          console.log("📤 Updated states:", newStates);
          return newStates;
        });
      }
    }
  }, []);

  // Handle upload progress event
  const handleUploadProgress = useCallback((data: MangaUploadProgress) => {
    console.log("📊 Context received upload:progress event:", data);
    const mangaId = data.mangaId;
    if (mangaId) {
      // Build task description
      let task = "";
      if (data.type === 'cover') {
        task = `Uploading cover (${data.uploadedImages}/${data.totalImages})`;
      } else if (data.type === 'episode') {
        task = `Uploading ${data.episodeName} (${data.episodeUploadedImages}/${data.episodeTotalImages} images) - Overall: ${data.uploadedImages}/${data.totalImages}`;
      }
      
      // Update localStorage
      setMangaUploadState(mangaId, {
        isUploading: true,
        progress: data.progress,
        currentTask: task,
        lastUpdated: Date.now()
      });
      
      const state = getMangaUploadState(mangaId);
      console.log("📊 Progress state from localStorage:", state);
      if (state) {
        setStates(prev => {
          const newStates = { ...prev, [mangaId]: state };
          console.log("📊 Updated states:", newStates);
          return newStates;
        });
      }
      // Call progress callback if exists
      callbacksRef.current[mangaId]?.onProgress?.(data);
    }
  }, []);

  // Handle upload complete event
  const handleUploadComplete = useCallback((data: MangaUploadComplete) => {
    const mangaId = data.mangaId;
    if (mangaId) {
      // Update localStorage
      setMangaUploadState(mangaId, {
        isUploading: false,
        progress: 100,
        currentTask: data.message || "Upload completed!",
        lastUpdated: Date.now()
      });
      
      const state = getMangaUploadState(mangaId);
      if (state) {
        setStates(prev => ({ ...prev, [mangaId]: state }));
      }
      
      // Call complete callback if exists
      callbacksRef.current[mangaId]?.onComplete?.(data);
      
      // Remove from states after delay
      setTimeout(() => {
        setStates(prev => {
          const newStates = { ...prev };
          delete newStates[mangaId];
          return newStates;
        });
        // Clear localStorage after showing completion
        setTimeout(() => {
          clearMangaUploadState(mangaId);
        }, 1000);
      }, 5000);
    }
  }, []);

  // Handle upload error event
  const handleUploadError = useCallback((data: MangaUploadError) => {
    const mangaId = data.mangaId;
    if (mangaId) {
      // Clear upload state immediately on error
      clearMangaUploadState(mangaId);
      
      const state = getMangaUploadState(mangaId);
      if (state) {
        setStates(prev => ({ ...prev, [mangaId]: state }));
      }
      
      // Call error callback if exists
      callbacksRef.current[mangaId]?.onError?.(data);
      
      // Remove from states immediately on error
      setTimeout(() => {
        setStates(prev => {
          const newStates = { ...prev };
          delete newStates[mangaId];
          return newStates;
        });
      }, 5000);
    }
  }, []);

  // Subscribe a manga ID to updates
  const subscribe = useCallback((mangaId: number, callbacks?: MangaCallbacks) => {
    console.log("🔔 Context: Subscribing to manga:", mangaId, "with callbacks:", !!callbacks);
    setSubscribers(prev => new Set(prev).add(mangaId));
    
    // Store callbacks if provided
    if (callbacks) {
      callbacksRef.current[mangaId] = callbacks;
    }
    
    // Load initial state
    const state = getMangaUploadState(mangaId);
    console.log("🔔 Context: Initial state for manga", mangaId, ":", state);
    if (state && state.isUploading) {
      setStates(prev => {
        const newStates = { ...prev, [mangaId]: state };
        console.log("🔔 Context: Updated states after subscribe:", newStates);
        return newStates;
      });
    }
  }, []);

  // Unsubscribe a manga ID
  const unsubscribe = useCallback((mangaId: number) => {
    console.log("🔕 Context: Unsubscribing from manga:", mangaId);
    setSubscribers(prev => {
      const newSet = new Set(prev);
      newSet.delete(mangaId);
      return newSet;
    });
    
    // Remove callbacks
    delete callbacksRef.current[mangaId];
  }, []);

  // Poll localStorage for updates (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      subscribers.forEach(mangaId => {
        const state = getMangaUploadState(mangaId);
        if (state && state.isUploading) {
          setStates(prev => ({
            ...prev,
            [mangaId]: state,
          }));
        } else if (states[mangaId]) {
          // Remove from states if no longer uploading
          setStates(prev => {
            const newStates = { ...prev };
            delete newStates[mangaId];
            return newStates;
          });
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [subscribers, states]);

  return (
    <MangaUploadSocketContext.Provider value={{ socket, states, subscribe, unsubscribe }}>
      {children}
    </MangaUploadSocketContext.Provider>
  );
};

export const useMangaUploadSocketContext = () => {
  const context = useContext(MangaUploadSocketContext);
  if (!context) {
    throw new Error("useMangaUploadSocketContext must be used within MangaUploadSocketProvider");
  }
  return context;
};

// Hook for pages that need upload progress with callbacks
export const useContextMangaUpload = (
  mangaId: number,
  callbacks?: {
    onProgress?: (data: MangaUploadProgress) => void;
    onComplete?: (data: MangaUploadComplete) => void;
    onError?: (data: MangaUploadError) => void;
  }
) => {
  const { states, subscribe, unsubscribe } = useMangaUploadSocketContext();

  React.useEffect(() => {
    subscribe(mangaId, callbacks);
    return () => unsubscribe(mangaId);
  }, [mangaId, subscribe, unsubscribe]);

  const state = states[mangaId] || {
    isUploading: false,
    progress: 0,
    currentTask: "",
    lastUpdated: 0,
  };

  return {
    isUploading: state.isUploading,
    progress: state.progress,
    currentTask: state.currentTask,
  };
};
