import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { getToken } from "../utils/storage";
import { toast } from "react-hot-toast";
import { useAuth } from "./useAuth";


const useSocketCheckVideos = (
  onCheckingUpdated?: (data: {
    user_id: number;
    video_id: number;
    checking: string;
    comment?: string;
    role?: string;
  }) => void
) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(server, {
      transports: ["websocket"],
      auth: { token: getToken() },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    // ✅ Connection successful
    socket.on("connect", () => {
      console.log("🟢 Connected to Socket.IO server for checking");
    });

    // mise à jour du statut de checking
    socket.on(
      "checking",
      (data: {
        user_id: number;
        video_id: number;
        checking: string;
        comment?: string;
        role?: string;
      }) => {

        const currentUserId = Number(user?.id);
        const isVideoOwner = data.user_id === currentUserId;
        const isSuperadmin = user?.role === "superadmin";

        if (!isVideoOwner && !isSuperadmin) {
          return;
        }

        const checkingStatus =
          data.checking === "ready"
            ? "prête"
            : data.checking === "checked"
            ? "vérifiée"
            : data.checking === "rejected"
            ? "rejetée"
            : data.checking;

        if (isVideoOwner && !isSuperadmin) {
          toast.success(
            `✅ Your video ${data.video_id} has been marked as ${checkingStatus}`
          );
        } else if (isSuperadmin && isVideoOwner) {
          toast.success(
            `✅ Your video ${data.video_id} has been marked as ${checkingStatus}`
          );
        } else if (isSuperadmin && !isVideoOwner) {
          toast.success(
            `✅ Video ${data.video_id} marked as ${checkingStatus}`
          );
        }

        if (onCheckingUpdated) onCheckingUpdated(data);
      }
    );

    return () => {
      console.log("🔌 Disconnecting from Socket.IO checking server");
      socket.disconnect();
    };
  }, [user, onCheckingUpdated]);

  return socketRef.current;
};

export default useSocketCheckVideos;
