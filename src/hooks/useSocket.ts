import axios from "axios"
import { useEffect, useState } from "react"
import { apiURL, server } from "../constant"
import { getToken } from "../utils/storage"
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const useSocket = () => {
    const [id, setId] = useState<string | null>(null)

    useEffect(() => {
        (async () => {
            await axios.get<{ role: string, id: any }>(apiURL + '/auth', {
                headers: { Authorization: `Bearer ${getToken()}` },
            })
                .then((res) => {
                    setId(res.data.id)
                    console.log(res.data);
                })
        })()
    }, [])

    useEffect(() => {
        if (!id)
            return;

        if (!socket) {
            socket = io(server); // 🔗 adapte selon ton backend
        }

        socket.on("connect", () => {
            console.log("🟢 Connecté au serveur Socket.IO");
        });

        socket.on("deleted-user", (data) => {
            if (String(id) !== String(data.userId))
                return;

            window.location.reload()
        });

        socket.on("disconnect", () => {
            console.log("🔴 Déconnecté du serveur Socket.IO");
        });

        return () => {
            socket?.off("deleted-user");
        };
    }, [id]);
}

export default useSocket;