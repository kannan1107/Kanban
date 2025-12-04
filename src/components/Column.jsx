import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { useTask } from '../context/TaskContext';
 
export default function Column({ column, onEditTask, activeTaskId }) {
  const { state } = useTask();
  const { setNodeRef } = useDroppable({ id: column.id });
   
  // Ensure taskIds are unique to prevent React key errors
  const uniqueTaskIds = [...new Set(column.taskIds)];

  const tasks = uniqueTaskIds.map(taskId => 
    state.tasks.find(task => task.id === taskId)
  ).filter(Boolean);

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-96 flex-1">
      <h2 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
        {column.title}
        <span className="bg-gray-200 text-gray-600 text-sm px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h2>
      
      <div ref={setNodeRef} className="space-y-3">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            // Do not render the task card if it's the one currently being dragged
            task.id === activeTaskId ? null : (
              <TaskCard key={task.id} task={task} onEdit={onEditTask} />
            )
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
