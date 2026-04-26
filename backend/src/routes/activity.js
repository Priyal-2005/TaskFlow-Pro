import { Router } from "express";
import protect from "../middleware/auth.js";
import { isProjectMember } from "../middleware/role.js";
import { getProjectActivity } from "../services/activityService.js";

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/activity/project/:projectId
 * @desc    Get activity log for a project
 * @access  Private + isProjectMember
 */
router.get("/project/:projectId", isProjectMember, async (req, res) => {
  try {
    const activities = await getProjectActivity(req.params.projectId);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
