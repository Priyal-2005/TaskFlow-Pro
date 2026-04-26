import { Router } from "express";
import protect from "../middleware/auth.js";
import { isProjectOwner, isProjectMember } from "../middleware/role.js";
import validate from "../middleware/validate.js";
import { createProjectSchema, updateProjectSchema, addMemberSchema } from "../validators/schemas.js";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
} from "../controllers/projectController.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/", validate(createProjectSchema), createProject);
router.get("/", getProjects);
router.get("/:id", isProjectMember, getProject);
router.put("/:id", isProjectOwner, validate(updateProjectSchema), updateProject);
router.delete("/:id", isProjectOwner, deleteProject);
router.post("/:id/add-member", isProjectOwner, validate(addMemberSchema), addMember);

export default router;
