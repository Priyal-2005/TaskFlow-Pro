import Project from "../models/Project.js";

/**
 * Middleware: require the authenticated user to be the project owner.
 * Expects :id or :projectId in route params (or body.project for task routes).
 */
export const isProjectOwner = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (!project.owner.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only the project owner can perform this action" });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Middleware: require the authenticated user to be a member (or owner) of the project.
 * Expects :id or :projectId in route params (or body.project for task routes).
 */
export const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId || req.body.project;

    if (!projectId) {
      return res.status(400).json({ success: false, message: "Project ID is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const isMember = project.members.some((m) => m.equals(req.user._id));
    if (!isMember) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * Reusable middleware factory: authorize by project role.
 *
 * @param {"owner" | "member"} role - Required role level
 * @returns Express middleware
 *
 * Usage:
 *   router.put("/:id", authorizeProjectRole("owner"), updateProject);
 *   router.post("/", authorizeProjectRole("member"), createTask);
 */
export const authorizeProjectRole = (role) => {
  if (role === "owner") return isProjectOwner;
  if (role === "member") return isProjectMember;
  throw new Error(`Unknown project role: ${role}`);
};
