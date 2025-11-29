import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { useAuth } from "./useAuth";
import { getToken } from "../utils/storage";
import { toast } from "react-hot-toast";


const useSockretSync = (onSyncFinished?: (videoId: string | number) => void) => {
    const { user } = useAuth()
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
    if (!user?.id) return;
    const socket = io(server, {
        transports: ["websocket"],
        auth: { token: getToken() }, // envoie le token d'auth côté serveur
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect_error", (err) => {
      console.error("🔴 Erreur de connexion Socket.IO :", err.message);
    });

    // Événement succès de traitement (sync terminé)
    socket.on("deep-sync-success", (data: { videoId: string | number; message: string }) => {
      console.log("🎉 Sync complet :", data);
      toast.success(`✅ ${data.message} (Video ID: ${data.videoId})`);
        if (onSyncFinished) onSyncFinished(data.videoId);
    });

    // Événement échec de traitement
    socket.on("deep-sync-failed", (data: { videoId: string | number; error: string }) => {
      console.error("❌ Échec du deep sync :", data);
      toast.error(`Sync échoué pour la vidéo ${data.videoId}`);
        if (onSyncFinished) onSyncFinished(data.videoId);
    });

    // Nettoyage à la fermeture du composant
    return () => {
      console.log("🔌 Déconnexion du serveur Socket.IO");
      socket.disconnect();
    };

    }, [user?.id, onSyncFinished]);

    return socketRef.current;
};

export default useSockretSync;