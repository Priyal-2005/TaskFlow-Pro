import { useState, useEffect } from "react";
import api from "../services/api";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId, status) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { status });
      setTasks((prev) => prev.map((t) => t._id === taskId ? data.data : t));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };
  
  const uploadAttachment = async (taskId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post(`/tasks/${taskId}/upload`, formData);
      setTasks((prev) => prev.map((t) => t._id === taskId ? data.data : t));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  };

  return { tasks, isLoading, error, refetch: fetchTasks, updateTaskStatus, deleteTask, uploadAttachment };
}
