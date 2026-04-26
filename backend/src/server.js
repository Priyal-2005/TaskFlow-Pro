import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/project.js";
import taskRoutes from "./routes/task.js";
import protect from "./middleware/auth.js";

// ─── Connect to MongoDB ──────────────────────────
await connectDB();

// ─── App Setup ───────────────────────────────────
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Routes ──────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
