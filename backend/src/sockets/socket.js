import { Server } from "socket.io";

let io;

/**
 * Initialize Socket.io and attach it to the HTTP server.
 *
 * @param {import("http").Server} httpServer - The Node HTTP server
 * @returns {Server} The Socket.io server instance
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    // Client joins a project room to receive real-time updates
    socket.on("join_project", (projectId) => {
      if (projectId) {
        socket.join(projectId);
      }
    });

    // Client leaves a project room
    socket.on("leave_project", (projectId) => {
      if (projectId) {
        socket.leave(projectId);
      }
    });
  });

  return io;
};

/**
 * Get the current Socket.io server instance.
 * Call this from controllers/services after initSocket has been called.
 *
 * @returns {Server} The Socket.io server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized — call initSocket first");
  }
  return io;
};
