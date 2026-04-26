import "dotenv/config";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import { initSocket } from "./sockets/socket.js";
import errorHandler from "./middleware/errorHandler.js";
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

// ─── Global Middleware ───────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Rate limiting — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// ─── Routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);

// Protected test route
app.get("/api/protected", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route working",
    user: req.user,
  });
});

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "TaskFlow Pro API" });
});

// ─── Global Error Handler (must be last) ─────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
