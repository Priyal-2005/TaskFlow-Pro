import { useState } from "react";
import { CheckSquare, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import { TaskCard } from "../components/task/TaskCard";
import { PageLoader } from "../components/ui/Spinner";
import useAuthStore from "../store/authStore";

export function MyTasks() {
  const { tasks, isLoading, updateTaskStatus, deleteTask, uploadAttachment } = useTasks();
  const { projects } = useProjects();
  const user = useAuthStore(state => state.user);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  if (isLoading) return <PageLoader />;

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (projectFilter !== "all" && task.project?._id !== projectFilter) return false;
    return true;
  });

  const todoTasks = filteredTasks.filter(t => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in-progress");
  const doneTasks = filteredTasks.filter(t => t.status === "done");

  const handleUpdate = async (id, status) => {
    const res = await updateTaskStatus(id, status);
    if (res.success) toast.success("Task updated");
    else toast.error(res.error || "Failed to update task");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    const res = await deleteTask(id);
    if (res.success) toast.success("Task deleted");
    else toast.error(res.error || "Failed to delete task");
  };

  const handleUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await uploadAttachment(id, file);
    if (res.success) toast.success("File uploaded");
    else toast.error(res.error || "Upload failed");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all tasks assigned to you.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="bg-transparent text-sm font-medium text-gray-700 outline-none"
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <select 
              className="bg-transparent text-sm font-medium text-gray-700 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare size={24} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No tasks yet</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto">
            You don't have any tasks assigned to you right now. Relax or check your projects!
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-gray-500">No tasks match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-700 mb-2">To Do ({todoTasks.length})</h3>
            {todoTasks.map(task => (
              <TaskCard key={task._id} task={task} user={user} onUpdate={handleUpdate} onDelete={handleDelete} onUpload={handleUpload} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-700 mb-2">In Progress ({inProgressTasks.length})</h3>
            {inProgressTasks.map(task => (
              <TaskCard key={task._id} task={task} user={user} onUpdate={handleUpdate} onDelete={handleDelete} onUpload={handleUpload} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-gray-700 mb-2">Done ({doneTasks.length})</h3>
            {doneTasks.map(task => (
              <TaskCard key={task._id} task={task} user={user} onUpdate={handleUpdate} onDelete={handleDelete} onUpload={handleUpload} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
