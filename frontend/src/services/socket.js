import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export const socket = io(BASE_URL, {
  autoConnect: false, // connect after login

  auth: {
    token: localStorage.getItem("token"),
  },

  transports: ["websocket"], // faster + cleaner

  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});