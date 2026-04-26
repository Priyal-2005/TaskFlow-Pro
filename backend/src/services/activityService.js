import Activity from "../models/Activity.js";

/**
 * Log an activity entry for a project.
 *
 * @param {string} userId    - ID of the user performing the action
 * @param {string} projectId - ID of the related project
 * @param {string} action    - Action verb (created, updated, deleted, etc.)
 * @param {string} entity    - Entity type ("task" | "project")
 * @param {string} entityId  - ID of the affected entity
 * @param {string} message   - Human-readable description
 */
export const logActivity = async (userId, projectId, action, entity, entityId, message) => {
  try {
    await Activity.create({
      user: userId,
      project: projectId,
      action,
      entity,
      entityId,
      message,
    });
  } catch (error) {
    // Log failures should never crash the request
    console.error("Activity log error:", error.message);
  }
};

/**
 * Retrieve activity history for a project.
 *
 * @param {string} projectId - Project to fetch activity for
 * @param {number} limit     - Max entries to return (default 50)
 */
export const getProjectActivity = async (projectId, limit = 50) => {
  return Activity.find({ project: projectId })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(limit);
};
