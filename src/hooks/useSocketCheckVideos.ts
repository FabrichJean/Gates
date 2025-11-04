import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { getToken } from "../utils/storage";
import { toast } from "react-hot-toast";
import { useAuth } from "./useAuth";

/**
 * Hook personnalisé pour gérer la connexion Socket.IO pour les événements de checking des vidéos.
 * - Authentifie automatiquement l'utilisateur
 * - Écoute l'événement 'checking' du backend
 * - Déclenche un callback pour rafraîchir les données quand l'état de checking change
 */
const useSocketCheckVideos = (onCheckingUpdated?: (data: { user_id: number; video_id: number; checking: string; comment?: string; role?: string }) => void) => {

  const {user} = useAuth()
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

    // ⚠️ Connection error
    socket.on("connect_error", (err) => {
      console.error("🔴 Socket.IO checking connection error:", err.message);
    });

    // 🔁 Reconnection attempt
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Checking reconnection attempt (${attempt})...`);
    });

    // mise à jour du statut de checking
    socket.on("checking", (data: { user_id: number; video_id: number; checking: string; comment?: string; role?: string }) => {
      console.log("📋 Mise à jour checking reçue :", data);
      
      const currentUserId = Number(user?.id);
      const isVideoOwner = data.user_id === currentUserId;
      const isSuperadmin = user?.role === 'superadmin';
      
      if (!isVideoOwner && !isSuperadmin) {
        console.log(`🚫 Notification ignored - Video ${data.video_id} belongs to user ${data.user_id}, connected user: ${currentUserId} (role: ${user?.role})`);
        return;
      }
      
      const checkingStatus = data.checking === 'ready' ? 'prête' : 
                           data.checking === 'checked' ? 'vérifiée' : 
                           data.checking === 'rejected' ? 'rejetée' : data.checking;
      
      if (isVideoOwner && !isSuperadmin) {
        toast.success(`✅ Your video ${data.video_id} has been marked as ${checkingStatus}`);
            } else if (isSuperadmin && isVideoOwner) {
        toast.success(`✅ Your video ${data.video_id} has been marked as ${checkingStatus}`);
            } else if (isSuperadmin && !isVideoOwner) {
        toast.success(`✅ Video ${data.video_id} marked as ${checkingStatus}`);
      }

      if (onCheckingUpdated) onCheckingUpdated(data);
    });

    return () => {
      console.log("🔌 Disconnecting from Socket.IO checking server");
      socket.disconnect();
    };
  }, [user, onCheckingUpdated]);

  return socketRef.current;
};

export default useSocketCheckVideos;