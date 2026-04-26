import { Router } from "express";
import protect from "../middleware/auth.js";
import { isProjectMember } from "../middleware/role.js";
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/", isProjectMember, createTask);
router.get("/project/:projectId", isProjectMember, getTasksByProject);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
