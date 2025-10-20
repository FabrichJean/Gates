import { io } from "socket.io-client";
import { server } from "../constant";

export const socket = io(server, {
  transports: ["websocket"],
});

// tu peux aussi écouter des évènements globaux ici si tu veux
socket.on("connect", () => {
  console.log("✅ Connecté au serveur Socket.IO :", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Déconnecté du serveur Socket.IO");
});
