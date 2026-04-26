import Project from "../models/Project.js";
import User from "../models/User.js";

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
    });

    // Populate owner & members for the response
    await project.populate("owner", "name email");
    await project.populate("members", "name email");

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects where user is owner or member
 * @access  Private
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project (must be member — enforced by middleware)
 * @access  Private + isProjectMember
 */
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project (owner only — enforced by middleware)
 * @access  Private + isProjectOwner
 */
export const updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    )
      .populate("owner", "name email")
      .populate("members", "name email");

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project (owner only — enforced by middleware)
 * @access  Private + isProjectOwner
 */
export const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @route   POST /api/projects/:id/add-member
 * @desc    Add a member to the project (owner only — enforced by middleware)
 * @access  Private + isProjectOwner
 */
export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    // Verify the target user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const project = req.project; // attached by isProjectOwner middleware

    // Prevent duplicate members
    if (project.members.some((m) => m.equals(userId))) {
      return res.status(400).json({ success: false, message: "User is already a member" });
    }

    project.members.push(userId);
    await project.save();

    await project.populate("owner", "name email");
    await project.populate("members", "name email");

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
