import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTask } from '../context/TaskContext';

export default function TaskCard({ task, onEdit }) {
  const { dispatch } = useTask();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    // FIX 1: Use CSS.Translate instead of CSS.Transform to prevent scaling distortion
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // FIX 2: Essential for dragging to work correctly on touch devices
    touchAction: 'none', 
  };

  const handleDelete = () => {
    if (!task.id) return;
    
    if (!window.confirm(`Are you sure you want to delete this task: "${task.title}"?`)) {
      return;
    }
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      // Note: Having onClick here might trigger the Edit modal after you finish dragging.
      // If that happens, consider removing this line and relying only on the Edit button below.
      onClick={() => onEdit(task)}
    >
      <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {task.priority && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
          {task.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center">
          <button
            // FIX 3: Stop pointer down propagation so clicking button doesn't start a drag
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
          
          <button
            // FIX 3: Stop pointer down propagation here as well
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="text-blue-500 hover:text-blue-700 text-sm ml-2"
          >
            Edit
          </button>
        </div>
      </div>
      
      {task.deadline && (
        <div className="mt-2 text-xs text-gray-500">
          Due: {new Date(task.deadline).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
