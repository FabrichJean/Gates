import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiURL, server } from "../constant";
import { getToken } from "../utils/storage";
import { toast } from "react-hot-toast";

/**
 * Hook personnalisé pour gérer la connexion Socket.IO côté client.
 * - Authentifie automatiquement l'utilisateur
 * - Écoute les événements backend liés au traitement vidéo (upload, transcodage, etc.)
 * - Déclenche un callback quand un upload est terminé (succès ou échec)
 */
const useSocketSend = (onUploadFinished?: (videoId: string) => void) => {
  const [userId, setUserId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // 🧠 Étape 1 — Authentification pour récupérer l'ID utilisateur
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ role: string; id: number }>(
          `${apiURL}/auth`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        setUserId(String(res.data.id));
      } catch (err) {
        console.error("❌ Erreur d’authentification :", err);
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
    socket.on("deep-upload-success", (data: { videoId: string; message: string }) => {
      console.log("🎉 Upload complet :", data);
      toast.success(`✅ ${data.message} (Video ID: ${data.videoId})`);

      // 🔥 Appel du callback pour retirer la vidéo du localStorage côté frontend
      if (onUploadFinished) onUploadFinished(String(data.videoId));
    });

    // 🔴 Événement échec de traitement
    socket.on("deep-upload-failed", (data: { videoId: string; error: string }) => {
      console.error("❌ Échec du deep upload :", data);
      toast.error(`❌ Upload échoué pour la vidéo ${data.videoId}`);
      if (onUploadFinished) onUploadFinished(String(data.videoId));
    });

    // 🔚 Nettoyage à la fermeture du composant
    return () => {
      console.log("🔌 Déconnexion du serveur Socket.IO");
      socket.disconnect();
    };
  }, [userId, onUploadFinished]);

  return socketRef.current;
};

export default useSocketSend;
