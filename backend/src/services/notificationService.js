import Notification from "../models/Notification.js";
import Project from "../models/Project.js";

/**
 * Send a notification to a single user.
 *
 * @param {string} userId  - Recipient user ID
 * @param {string} message - Notification text
 */
export const notifyUser = async (userId, message) => {
  try {
    await Notification.create({ user: userId, message });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

/**
 * Send a notification to every member of a project.
 * Optionally exclude a user (e.g. the actor who triggered the event).
 *
 * @param {string} projectId - Project whose members will be notified
 * @param {string} message   - Notification text
 * @param {string} [excludeUserId] - User ID to skip (usually the actor)
 */
export const notifyProjectMembers = async (projectId, message, excludeUserId = null) => {
  try {
    const project = await Project.findById(projectId).select("members");
    if (!project) return;

    const recipients = project.members.filter(
      (memberId) => !excludeUserId || !memberId.equals(excludeUserId)
    );

    const notifications = recipients.map((userId) => ({
      user: userId,
      message,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};
