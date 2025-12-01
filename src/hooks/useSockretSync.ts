import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { useAuth } from "./useAuth";
import { getToken } from "../utils/storage";

type UseSocketSyncOptions = {
  onSyncFinished?: (data: any) => void;
  onSyncProgress?: (data: any) => void;
};

const useSockretSync = (opts?: UseSocketSyncOptions) => {
  const { onSyncFinished, onSyncProgress } = opts || {};
  const { user } = useAuth();
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
      console.error("🔴 Erreur de connexion Socket.IO :", err?.message ?? err);
    });

    // écoute l'événement envoyé par le backend
    socket.on("sync:progress", (data: any) => {
      try {
        if (typeof onSyncProgress === "function") onSyncProgress(data);
        // si le backend signale la fin via sync:progress, on peut aussi appeler onSyncFinished
        if (data && (data.finished === true || data.done === true) && typeof onSyncFinished === "function") {
          onSyncFinished(data);
        }
      } catch (err) {
        console.error("Error in sync:progress handler:", err);
      }
    });

    // optionnel: écoute d'autres events utiles
    socket.on("disconnect", () => {
      // console.info("Socket disconnected");
    });

    return () => {
      try {
        socket.off("sync:progress");
        socket.off("connect_error");
        socket.off("disconnect");
        socket.disconnect();
      } catch (e) {
        // ignore
      }
      socketRef.current = null;
    };
  }, [user?.id, onSyncFinished, onSyncProgress]);

  return socketRef.current;
};

export default useSockretSync;