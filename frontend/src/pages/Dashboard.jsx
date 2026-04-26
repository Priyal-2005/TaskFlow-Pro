import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Folder } from "lucide-react";
import api from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { PageLoader } from "../components/ui/Spinner";

export function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data } = await api.post("/projects", newProject);
      setProjects([data.data, ...projects]);
      setIsModalOpen(false);
      setNewProject({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your workspaces and teams.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder size={24} className="text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
          <p className="text-gray-500 mt-1 mb-6 max-w-sm mx-auto">
            Get started by creating a new project to organize your tasks and collaborate with your team.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project._id} 
              to={`/projects/${project._id}`}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group block"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Folder size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg truncate">{project.name}</h3>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                {project.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700" title={`Owner: ${project.owner.name}`}>
                    {project.owner.name.charAt(0)}
                  </div>
                  {project.members.slice(0, 3).map((member) => (
                    <div key={member._id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600" title={member.name}>
                      {member.name.charAt(0)}
                    </div>
                  ))}
                  {project.members.length > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {project.members.length + 1} members
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <Input 
              value={newProject.name} 
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} 
              placeholder="e.g., Marketing Campaign"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea 
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none h-24"
              value={newProject.description} 
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} 
              placeholder="What is this project about?"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isCreating}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
