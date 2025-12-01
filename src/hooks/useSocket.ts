import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { server } from "../constant";
import { useAuth } from "./useAuth";

const useSocket = () => {
  const { user } = useAuth();
  const id = user?.id
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!id) return;

    socketRef.current = io(server);

    socketRef.current.on("connect", () => console.log("🟢 Connecté au serveur Socket.IO"));

    socketRef.current.on("deleted-user", (data) => {
      if (String(id) === String(data.userId)) window.location.reload();
    });

    socketRef.current.on("update-user", (data) => {
      if (String(id) === String(data.userId)) {
        localStorage.removeItem('authToken');
        window.location.reload()
      };
    });

    socketRef.current.on("disconnect", () => console.log("🔴 Déconnecté du serveur Socket.IO"));

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  return { socket: socketRef.current, id };
};

export default useSocket;