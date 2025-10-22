import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { apiURL, server } from "../constant";
import { getToken } from "../utils/storage";

const useSocket = () => {
  const [id, setId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ role: string; id: number }>(
          `${apiURL}/auth`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        setId(String(res.data.id));
      } catch (err) {
        console.error("Erreur d’authentification :", err);
      }
    })();
  }, []);

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