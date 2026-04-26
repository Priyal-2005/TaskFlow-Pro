import { Link } from "react-router-dom";
import { Folder } from "lucide-react";

export function ProjectCard({ project }) {
  return (
    <Link 
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
  );
}
