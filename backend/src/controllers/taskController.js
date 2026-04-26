import Task from "../models/Task.js";
import Project from "../models/Project.js";

/**
 * @route   POST /api/tasks
 * @desc    Create a task inside a project (must be member — enforced by middleware)
 * @access  Private + isProjectMember
 */
export const createTask = async (req, res) => {
  try {
    const { title, description, status, project: projectId, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    // If assigning, verify assignee is a project member
    if (assignedTo) {
      const proj = req.project; // attached by isProjectMember middleware
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

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/tasks/project/:projectId
 * @desc    Get all tasks for a project (must be member — enforced by middleware)
 * @access  Private + isProjectMember
 */
export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task (title, description, status, assignedTo)
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // Verify user is a member of the task's project
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ success: false, message: "Associated project not found" });
    }

    const isMember = project.members.some((m) => m.equals(req.user._id));
    if (!isMember) {
      return res.status(403).json({ success: false, message: "You are not a member of this project" });
    }

    // If reassigning, verify new assignee is a project member
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

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (only task creator or project owner)
 * @access  Private
 */
export const deleteTask = async (req, res) => {
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

    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
