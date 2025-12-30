import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../../constant";
import { getToken } from "../../utils/storage";
import { toast } from "react-hot-toast";
import { useAuth } from "../useAuth";


const useSocketRomans = (
  onCheckingUpdated?: (data: {
    user_id: number;
    roman_id: number;
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
      console.log("🟢 Connected to Socket.IO server for roman checking");
    });

    // mise à jour du statut de checking pour roman
    socket.on(
      "roman-checking",
      (data: {
        user_id: number;
        roman_id: number;
        checking: string;
        comment?: string;
        role?: string;
      }) => {

        const currentUserId = Number(user?.id);
        const isRomanOwner = data.user_id === currentUserId;
        const isSuperadmin = user?.role === "superadmin";

        if (!isRomanOwner && !isSuperadmin) {
          return;
        }

        const checkingStatus =
          data.checking === "ready"
            ? "prêt"
            : data.checking === "checked"
            ? "vérifié"
            : data.checking === "refused"
            ? "refusé"
            : data.checking;

        if (isRomanOwner && !isSuperadmin) {
          toast.success(
            `✅ Votre roman ${data.roman_id} a été marqué comme ${checkingStatus}`
          );
        } else if (isSuperadmin && isRomanOwner) {
          toast.success(
            `✅ Votre roman ${data.roman_id} a été marqué comme ${checkingStatus}`
          );
        } else if (isSuperadmin && !isRomanOwner) {
          toast.success(
            `✅ Roman ${data.roman_id} marqué comme ${checkingStatus}`
          );
        }

        if (onCheckingUpdated) onCheckingUpdated(data);
      }
    );

    // écoute des statuts asynchrones (upload cover, etc.) émis par les workers
    socket.on("async-status", (payload: any) => {
      try {
        const { videoId, romanId, status, type, message, userId, entityType } = payload || {};

        const id = entityType === "roman" || payload.isRoman ? romanId : videoId;
        const label = entityType === "roman" || payload.isRoman ? "roman" : "vidéo";

        if (status === "finished") {
          toast.success(`✅ ${type} terminé pour ${label} ${id}`);
        } else if (status === "error") {
          toast.error(`❌ Erreur (${type}) pour ${label} ${id}: ${message || "unknown"}`);
        } else {
          // autres statuses possibles
          toast(`ℹ️ ${type} pour ${label} ${id}: ${status}`);
        }
        if (onCheckingUpdated) onCheckingUpdated(payload);
      } catch (err) {
        console.error("Error handling async-status socket event:", err);
      }
    });

    return () => {
      console.log("🔌 Disconnecting from Socket.IO roman checking server");
      socket.disconnect();
    };
  }, [user, onCheckingUpdated]);

  return socketRef.current;
};

export default useSocketRomans;
