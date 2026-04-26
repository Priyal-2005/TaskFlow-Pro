import { Router } from "express";
import protect from "../middleware/auth.js";
import { isProjectMember } from "../middleware/role.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import { createTaskSchema, updateTaskSchema } from "../validators/schemas.js";
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  uploadAttachment,
} from "../controllers/taskController.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/", validate(createTaskSchema), isProjectMember, createTask);
router.get("/project/:projectId", isProjectMember, getTasksByProject);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", deleteTask);
router.post("/:id/upload", upload.single("file"), uploadAttachment);

export default router;
