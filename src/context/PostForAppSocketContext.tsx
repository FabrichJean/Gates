import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";

interface PostForAppUpdateProgress {
  id: number;
  success: boolean;
  message: string;
  timestamp: string;
  current?: number;
  total?: number;
}

interface PostForAppBulkUpdateCallbacks {
  onProgress?: (data: PostForAppUpdateProgress) => void;
  onComplete?: (data: { total: number; success: number; failed: number }) => void;
  onError?: (data: { error: string; timestamp: string }) => void;
}

interface PostForAppSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (callbacks?: PostForAppBulkUpdateCallbacks) => void;
  unsubscribe: () => void;
  startBulkUpdate: (postIds: number[]) => void;
}

const PostForAppSocketContext = createContext<PostForAppSocketContextType | undefined>(undefined);

export const PostForAppSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef<PostForAppBulkUpdateCallbacks>({});
  const bulkUpdateStateRef = useRef<{
    total: number;
    success: number;
    failed: number;
    processed: Set<number>;
  }>({
    total: 0,
    success: 0,
    failed: 0,
    processed: new Set(),
  });

  // Initialize socket once
  useEffect(() => {
    const newSocket = io(server, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });

    newSocket.on("connect", () => {
      console.log("🟢 PostForApp socket connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 PostForApp socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ PostForApp socket error:", error);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 PostForApp socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    // Listen to PostForApp update events
    newSocket.on("postForApp:updated", handlePostUpdate);
    newSocket.on("postForApp:notFound", handlePostNotFound);
    newSocket.on("postForApp:bulkUpdateStart", handleBulkUpdateStart);
    newSocket.on("postForApp:bulkUpdateCompleted", handleBulkUpdateCompleted);
    newSocket.on("postForApp:bulkUpdateError", handleBulkUpdateError);

    setSocket(newSocket);

    return () => {
      console.log("🔌 Disconnecting PostForApp socket...");
      newSocket.disconnect();
    };
  }, []);

  // Handle individual post update success
  const handlePostUpdate = useCallback((data: PostForAppUpdateProgress) => {
    console.log("✅ PostForApp updated:", data);
    bulkUpdateStateRef.current.success++;
    bulkUpdateStateRef.current.processed.add(data.id);

    // Call progress callback
    callbacksRef.current.onProgress?.({
      ...data,
      current: bulkUpdateStateRef.current.processed.size,
      total: bulkUpdateStateRef.current.total,
    });
  }, []);

  // Handle individual post not found
  const handlePostNotFound = useCallback((data: PostForAppUpdateProgress) => {
    console.log("❌ PostForApp not found:", data);
    bulkUpdateStateRef.current.failed++;
    bulkUpdateStateRef.current.processed.add(data.id);

    // Call progress callback
    callbacksRef.current.onProgress?.({
      ...data,
      current: bulkUpdateStateRef.current.processed.size,
      total: bulkUpdateStateRef.current.total,
    });
  }, []);

  // Handle bulk update start
  const handleBulkUpdateStart = useCallback((data: { total: number }) => {
    console.log("🚀 Bulk update started for", data.total, "posts");
    bulkUpdateStateRef.current = {
      total: data.total,
      success: 0,
      failed: 0,
      processed: new Set(),
    };
  }, []);

  // Handle bulk update complete
  const handleBulkUpdateCompleted = useCallback((data: { success: boolean; message: string; summary: any; timestamp: string }) => {
    console.log("🎉 Bulk update completed:", data);
    callbacksRef.current.onComplete?.({
      total: bulkUpdateStateRef.current.total,
      success: bulkUpdateStateRef.current.success,
      failed: bulkUpdateStateRef.current.failed,
    });
  }, []);

  // Handle bulk update error
  const handleBulkUpdateError = useCallback((data: { success: boolean; message: string; error: string; timestamp: string }) => {
    console.error("💥 Bulk update error:", data);
    callbacksRef.current.onError?.({
      error: data.message || data.error,
      timestamp: data.timestamp
    });
  }, []);

  // Subscribe to bulk update events
  const subscribe = useCallback((callbacks?: PostForAppBulkUpdateCallbacks) => {
    if (callbacks) {
      callbacksRef.current = callbacks;
    }
  }, []);

  // Unsubscribe from events
  const unsubscribe = useCallback(() => {
    callbacksRef.current = {};
    bulkUpdateStateRef.current = {
      total: 0,
      success: 0,
      failed: 0,
      processed: new Set(),
    };
  }, []);

  // Start bulk update (emit event to server)
  const startBulkUpdate = useCallback((postIds: number[]) => {
    if (socket && isConnected) {
      socket.emit("postForApp:startBulkUpdate", { postIds });
    }
  }, [socket, isConnected]);

  const value: PostForAppSocketContextType = {
    socket,
    isConnected,
    subscribe,
    unsubscribe,
    startBulkUpdate,
  };

  return (
    <PostForAppSocketContext.Provider value={value}>
      {children}
    </PostForAppSocketContext.Provider>
  );
};

export const usePostForAppSocket = () => {
  const ctx = useContext(PostForAppSocketContext);
  if (!ctx) throw new Error("usePostForAppSocket must be used within PostForAppSocketProvider");
  return ctx;
};

export default PostForAppSocketContext;