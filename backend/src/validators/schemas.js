import { z } from "zod";

// ─── Auth Validators ────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Project Validators ─────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200),
  description: z.string().max(2000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

// ─── Task Validators ────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(300),
  description: z.string().max(5000).optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  project: z.string().min(1, "Project ID is required"),
  assignedTo: z.string().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["todo", "in-progress", "done"]).optional(),
  assignedTo: z.string().optional().nullable(),
});
