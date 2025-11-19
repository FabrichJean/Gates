import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { getToken } from "../utils/storage";
import { toast } from "react-hot-toast";
import { useAuth } from "./useAuth";

/**
 * Hook personnalisé pour gérer la connexion Socket.IO côté client.
 * - Authentifie automatiquement l'utilisateur
 * - Écoute les événements backend liés au traitement vidéo (upload, transcodage, etc.)
 * - Déclenche un callback quand un upload est terminé (succès ou échec)
 */
const useSocketProcessing = (onUploadFinished?: () => void, postId?: number) => {
 const {user} = useAuth()
  const socketRef = useRef<Socket | null>(null);

  // ⚙️ Étape 2 — Connexion socket dès que l'utilisateur est identifié
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

    // ✅ Connexion réussie
    socket.on("connect", () => {
      console.log("🟢 Connecté au serveur Socket.IO");
    });

    // ⚠️ Erreur de connexion
    socket.on("connect_error", (err) => {
      console.error("🔴 Erreur de connexion Socket.IO :", err.message);
      toast.error("Erreur de connexion au serveur temps réel !");
    });

    // 🔁 Tentative de reconnexion
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Tentative de reconnexion (${attempt})...`);
    });

    // 🟢 Événement succès de traitement (upload terminé)
    socket.on("deep-upload-post-success", (data: { userId: number, postId: number }) => {
      try {
        if(user?.id === data.userId && postId === data.postId) {
          onUploadFinished?.();
        }
      } catch (error) {
        console.error("Error processing post:", error);
      }

      // 🔥 Appel du callback pour retirer la vidéo du localStorage côté frontend
      // if (onUploadFinished) onUploadFinished(String(data.videoId));
    });

    // 🔴 Événement échec de traitement
    socket.on("deep-upload-post-failed", (data: { userId: number; summary: any, postId: number }) => {
      console.error("❌ Échec du deep upload :", data);
      try {
        if(user?.id === data.userId && postId === data.postId) {
          onUploadFinished?.();
          toast.error(`❌ Échec de l'upload `);
        }
      } catch (error) {
        console.error("Error processing post:", error);
      }
    });

    // 🔚 Nettoyage à la fermeture du composant
    return () => {
      console.log("🔌 Déconnexion du serveur Socket.IO");
      socket.disconnect();
    };
  }, [user, onUploadFinished]);

  return socketRef.current;
};

export default useSocketProcessing;
