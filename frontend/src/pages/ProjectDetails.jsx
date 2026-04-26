import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Users, Paperclip, MoreVertical, Trash2 } from "lucide-react";
import api from "../services/api";
import { socket } from "../services/socket";
import useAuthStore from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageLoader } from "../components/ui/Spinner";

export function ProjectDetails() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" });
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmailId, setMemberEmailId] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [allUsers, setAllUsers] = useState([]); // In a real app, you'd search by email

  const isOwner = project?.owner._id === user._id;

  useEffect(() => {
    fetchProjectData();
    
    // Connect Socket and join room
    socket.connect();
    socket.emit("join_project", id);

    socket.on("task_created", (task) => {
      setTasks((prev) => [task, ...prev]);
    });

    socket.on("task_updated", (updatedTask) => {
      setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? updatedTask : t));
    });

    socket.on("task_deleted", (taskId) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    });

    socket.on("project_updated", (updatedProject) => {
      setProject(updatedProject);
    });

    return () => {
      socket.emit("leave_project", id);
      socket.off("task_created");
      socket.off("task_updated");
      socket.off("task_deleted");
      socket.off("project_updated");
      // socket.disconnect(); // Don't disconnect if we want to keep receiving notifications
    };
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (error) {
      console.error("Failed to fetch project data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setIsCreatingTask(true);
    try {
      await api.post("/tasks", { ...newTask, project: id });
      // We don't manually add it to state because Socket.io will broadcast it back to us
      setIsTaskModalOpen(false);
      setNewTask({ title: "", description: "", assignedTo: "" });
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const handleFileUpload = async (taskId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/tasks/${taskId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsAddingMember(true);
    try {
      await api.post(`/projects/${id}/add-member`, { userId: memberEmailId });
      setIsMemberModalOpen(false);
      setMemberEmailId("");
    } catch (error) {
      console.error("Failed to add member", error);
      alert(error.response?.data?.message || "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!project) return <div>Project not found</div>;

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div>
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${isOwner ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {isOwner ? 'Owner' : 'Member'}
            </span>
          </div>
          <p className="text-gray-500 text-sm max-w-2xl">{project.description || "No description provided."}</p>
        </div>
        
        <div className="flex gap-3">
          {isOwner && (
            <Button variant="secondary" onClick={() => setIsMemberModalOpen(true)}>
              <Users size={18} className="mr-2" />
              Add Member
            </Button>
          )}
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <Plus size={18} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-240px)]">
        <TaskColumn title="To Do" tasks={todoTasks} status="todo" onUpdate={handleUpdateTaskStatus} onDelete={handleDeleteTask} onUpload={handleFileUpload} user={user} isOwner={isOwner} />
        <TaskColumn title="In Progress" tasks={inProgressTasks} status="in-progress" onUpdate={handleUpdateTaskStatus} onDelete={handleDeleteTask} onUpload={handleFileUpload} user={user} isOwner={isOwner} />
        <TaskColumn title="Done" tasks={doneTasks} status="done" onUpdate={handleUpdateTaskStatus} onDelete={handleDeleteTask} onUpload={handleFileUpload} user={user} isOwner={isOwner} />
      </div>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <Input 
              value={newTask.title} 
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
              placeholder="e.g., Design homepage UI"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea 
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24"
              value={newTask.description} 
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
              placeholder="Provide more details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To (optional)</label>
            <select
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-500"
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
            >
              <option value="">Unassigned</option>
              <option value={project.owner._id}>{project.owner.name} (Owner)</option>
              {project.members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreatingTask}>Create Task</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Add Member to Project">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <Input 
              value={memberEmailId} 
              onChange={(e) => setMemberEmailId(e.target.value)} 
              placeholder="Enter User ID (ObjectID)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">In a real app, this would be an email search dropdown.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsMemberModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isAddingMember}>Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import { TaskCard } from "../components/task/TaskCard";

function TaskColumn({ title, tasks, status, onUpdate, onDelete, onUpload, user, isOwner }) {
  return (
    <div className="flex-1 min-w-[300px] max-w-sm bg-gray-50/50 border border-gray-200/60 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {tasks.map(task => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onUpdate={onUpdate} 
            onDelete={onDelete} 
            onUpload={onUpload} 
            user={user} 
            isOwner={isOwner} 
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
