import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useProgressStore } from "./useProgressStore";
import { apiURL, server } from "../constant";
import { getToken } from "../utils/storage";
import axios from "axios";

let socket: Socket | null = null;

export function useSocketProgress() {
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

    const setProgress = useProgressStore((s) => s.setProgress);

    useEffect(() => {
        if (!id) 
            return;

        if (!socket) {
            socket = io(server); // 🔗 adapte selon ton backend
        }

        socket.on("connect", () => {
            console.log("🟢 Connecté au serveur Socket.IO");
        });

        socket.on("upload-progress", (data) => {
            if (id !== data.userId)
                return;

            console.log("📡 Progress event reçu :", data);
            setProgress(data);
        });

        socket.on("disconnect", () => {
            console.log("🔴 Déconnecté du serveur Socket.IO");
        });

        return () => {
            socket?.off("upload-progress");
        };
    }, [id, setProgress]);
}
