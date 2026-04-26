import Task from "../models/Task.js";
import Project from "../models/Project.js";
import { logActivity } from "../services/activityService.js";
import { notifyUser, notifyProjectMembers } from "../services/notificationService.js";
import { getIO } from "../sockets/socket.js";

/**
 * @route   POST /api/tasks
 * @desc    Create a task inside a project (must be member — enforced by middleware)
 * @access  Private + isProjectMember
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, project: projectId, assignedTo } = req.body;

    // If assigning, verify assignee is a project member
    if (assignedTo) {
      const proj = req.project;
      const isMember = proj.members.some((m) => m.equals(assignedTo));
      if (!isMember) {
        return res.status(400).json({ success: false, message: "Cannot assign task to a non-member" });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    });

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    await logActivity(
      req.user._id, projectId, "created", "task", task._id,
      `${req.user.name} created task '${task.title}'`
    );

    getIO().to(projectId).emit("task_created", task);

    if (assignedTo && !req.user._id.equals(assignedTo)) {
      await notifyUser(assignedTo, `You were assigned to task '${task.title}'`);
    }

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get all tasks for a project (must be member — enforced by middleware)
 * @access  Private + isProjectMember
 */
export const getTasksByProject = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("attachments.uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks assigned to the current user
 * @access  Private
 */
export const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("attachments.uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task (title, description, status, assignedTo)
 * @access  Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: "Associated project not found" });
    }

    const isMember = project.members.some((m) => m.equals(req.user._id));
    if (!isMember) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    if (req.body.assignedTo) {
      const assigneeIsMember = project.members.some((m) => m.equals(req.body.assignedTo));
      if (!assigneeIsMember) {
        return res.status(400).json({ success: false, message: "Cannot assign task to a non-member" });
      }
    }

    const { title, description, status, assignedTo } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();

    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    const projectId = task.project.toString();
    const changes = [];
    if (status !== undefined) changes.push(`status to '${status}'`);
    if (title !== undefined) changes.push(`title to '${title}'`);
    const changeMsg = changes.length > 0 ? changes.join(", ") : "details";

    await logActivity(
      req.user._id, projectId, "updated", "task", task._id,
      `${req.user.name} updated ${changeMsg} on task '${task.title}'`
    );

    getIO().to(projectId).emit("task_updated", task);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (only task creator or project owner)
 * @access  Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: "Associated project not found" });
    }

    const isCreator = task.createdBy.equals(req.user._id);
    const isOwner = project.owner.equals(req.user._id);

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, message: "Only the task creator or project owner can delete this task" });
    }

    const taskTitle = task.title;
    const projectId = task.project.toString();
    const taskId = task._id.toString();

    await Task.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user._id, projectId, "deleted", "task", taskId,
      `${req.user.name} deleted task '${taskTitle}'`
    );

    getIO().to(projectId).emit("task_deleted", taskId);

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/tasks/:id/upload
 * @desc    Upload a file attachment to a task
 * @access  Private (must be project member)
 */
export const uploadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: "Associated project not found" });
    }

    const isMember = project.members.some((m) => m.equals(req.user._id));
    if (!isMember) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    task.attachments.push({
      url: req.file.path,
      public_id: req.file.filename,
      uploadedBy: req.user._id,
    });

    await task.save();

    await task.populate("attachments.uploadedBy", "name email");
    await task.populate("assignedTo", "name email");
    await task.populate("createdBy", "name email");

    const projectId = task.project.toString();

    await logActivity(
      req.user._id, projectId, "uploaded", "task", task._id,
      `${req.user.name} uploaded a file to task '${task.title}'`
    );

    getIO().to(projectId).emit("task_updated", task);

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};
