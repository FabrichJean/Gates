import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiURL, server } from "../constant";
import { getToken } from "../utils/storage";
import { toast } from "react-hot-toast";

/**
 * Hook personnalisé pour gérer la connexion Socket.IO pour les événements de checking des vidéos.
 * - Authentifie automatiquement l'utilisateur
 * - Écoute l'événement 'checking' du backend
 * - Déclenche un callback pour rafraîchir les données quand l'état de checking change
 */
const useSocketCheckVideos = (onCheckingUpdated?: (data: { user_id: number; video_id: number; checking: string; comment?: string; role?: string }) => void) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ role: string; id: number }>(
          `${apiURL}/auth`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        setUserId(String(res.data.id));
        setUserRole(res.data.role);
      } catch (err) {
        console.error("❌ Authentication error:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;

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
      
      const currentUserId = Number(userId);
      const isVideoOwner = data.user_id === currentUserId;
      const isSuperadmin = userRole === 'superadmin';
      
      if (!isVideoOwner && !isSuperadmin) {
        console.log(`🚫 Notification ignored - Video ${data.video_id} belongs to user ${data.user_id}, connected user: ${currentUserId} (role: ${userRole})`);
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
  }, [userId, userRole, onCheckingUpdated]);

  return socketRef.current;
};

export default useSocketCheckVideos;