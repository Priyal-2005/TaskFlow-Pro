import { User, MoreVertical, Paperclip, Trash2 } from "lucide-react";
import { format } from "date-fns";

export function TaskCard({ task, onUpdate, onDelete, onUpload, user, isOwner }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-300 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 leading-tight">{task.title}</h4>
        <div className="relative">
          <select 
            className="opacity-0 absolute inset-0 cursor-pointer"
            value={task.status}
            onChange={(e) => onUpdate(task._id, e.target.value)}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <button className="text-gray-400 hover:text-gray-600 rounded p-1">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
      )}

      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {task.attachments.map(att => (
            <a key={att._id} href={att.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
              <Paperclip size={12} />
              {att.public_id.split('/').pop().substring(0, 10)}...
            </a>
          ))}
        </div>
      )}

      {task.project && task.project.name && (
         <div className="mb-3">
           <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{task.project.name}</span>
         </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-2">
          {task.assignedTo ? (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-medium text-blue-700" title={`Assigned to: ${task.assignedTo.name}`}>
              {task.assignedTo.name.charAt(0)}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-gray-400" title="Unassigned">
              <User size={12} />
            </div>
          )}
          <span className="text-[10px] text-gray-400">
            {format(new Date(task.createdAt), "MMM d")}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <label className="cursor-pointer p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <input type="file" className="hidden" onChange={(e) => onUpload(task._id, e)} />
            <Paperclip size={14} />
          </label>
          
          {(isOwner || task.createdBy._id === user._id) && (
            <button onClick={() => onDelete(task._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
