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

  // 🧠 Étape 1 — Authentification pour récupérer l'ID utilisateur et son rôle
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
        console.error("❌ Erreur d'authentification :", err);
      }
    })();
  }, []);

  // ⚙️ Étape 2 — Connexion socket dès que l'utilisateur est identifié
  useEffect(() => {
    if (!userId) return;

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
      console.log("🟢 Connecté au serveur Socket.IO pour checking");
    });

    // ⚠️ Erreur de connexion
    socket.on("connect_error", (err) => {
      console.error("🔴 Erreur de connexion Socket.IO checking :", err.message);
    });

    // 🔁 Tentative de reconnexion
    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Tentative de reconnexion checking (${attempt})...`);
    });

    // mise à jour du statut de checking
    socket.on("checking", (data: { user_id: number; video_id: number; checking: string; comment?: string; role?: string }) => {
      console.log("📋 Mise à jour checking reçue :", data);
      
      const currentUserId = Number(userId);
      const isVideoOwner = data.user_id === currentUserId;
      const isSuperadmin = userRole === 'superadmin';
      
      // 🔒 Déterminer qui doit recevoir la notification
      // 1. Propriétaire de la vidéo → toujours
      // 2. Superadmin → toujours (pour voir ses propres actions)
      if (!isVideoOwner && !isSuperadmin) {
        console.log(`🚫 Notification ignorée - Vidéo ${data.video_id} appartient à l'utilisateur ${data.user_id}, utilisateur connecté: ${currentUserId} (rôle: ${userRole})`);
        return;
      }
      
      const checkingStatus = data.checking === 'ready' ? 'prête' : 
                           data.checking === 'checked' ? 'vérifiée' : 
                           data.checking === 'rejected' ? 'rejetée' : data.checking;
      
      // Message personnalisé selon le contexte
      if (isVideoOwner && !isSuperadmin) {
        // Propriétaire normal de la vidéo
        toast.success(`✅ Votre vidéo ${data.video_id} a été marquée comme ${checkingStatus}`);
      } else if (isSuperadmin && isVideoOwner) {
        // Superadmin qui modifie sa propre vidéo
        toast.success(`✅ Votre vidéo ${data.video_id} a été marquée comme ${checkingStatus}`);
      } else if (isSuperadmin && !isVideoOwner) {
        // Superadmin qui modifie la vidéo de quelqu'un d'autre
        toast.success(`✅ Vidéo ${data.video_id} marquée comme ${checkingStatus}`);
      }

      if (onCheckingUpdated) onCheckingUpdated(data);
    });

    // 🔚 Nettoyage à la fermeture du composant
    return () => {
      console.log("🔌 Déconnexion du serveur Socket.IO checking");
      socket.disconnect();
    };
  }, [userId, userRole, onCheckingUpdated]);

  return socketRef.current;
};

export default useSocketCheckVideos;