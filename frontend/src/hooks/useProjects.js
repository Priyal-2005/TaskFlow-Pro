import { useState, useEffect } from "react";
import api from "../services/api";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/projects");
      setProjects(data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects, isLoading, error, refetch: fetchProjects, setProjects };
}
