import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import { initSocket } from "./sockets/socket.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
import activityRoutes from "./routes/activity.js";
import notificationRoutes from "./routes/notification.js";
import protect from "./middleware/auth.js";

// ─── Connect to MongoDB ──────────────────────────
await connectDB();

// ─── App Setup ───────────────────────────────────
const app = express();
const httpServer = createServer(app);

// ─── Socket.io ───────────────────────────────────
initSocket(httpServer);

app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// Protected test route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "TaskFlow Pro API" });
});

// ─── Start Server ────────────────────────────────
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
