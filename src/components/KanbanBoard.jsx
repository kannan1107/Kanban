import { useState } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import Column from './Column';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import { useTask } from '../context/TaskContext';

export default function KanbanBoard() {
  const { state, dispatch } = useTask();
  const [activeTask, setActiveTask] = useState(null);
  const [modalTask, setModalTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDragStart = (event) => {
    const task = state.tasks.find(t => t.id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTask = state.tasks.find(t => t.id === active.id);
    const sourceColumn = activeTask.status;
    const destinationColumn = over.id;

    if (sourceColumn === destinationColumn) {
      const column = state.columns[sourceColumn];
      const oldIndex = column.taskIds.indexOf(active.id);
      const newIndex = column.taskIds.indexOf(over.id);
      
      if (oldIndex !== newIndex) {
        const newTaskIds = arrayMove(column.taskIds, oldIndex, newIndex);
        dispatch({
          type: 'MOVE_TASK',
          payload: {
            taskId: active.id,
            sourceColumn,
            destinationColumn,
            destinationIndex: newIndex
          }
        });
      }
    } else {
      const destinationIndex = state.columns[destinationColumn].taskIds.length;
      dispatch({
        type: 'MOVE_TASK',
        payload: {
          taskId: active.id,
          sourceColumn,
          destinationColumn,
          destinationIndex
        }
      });
    }
  };

  const openModal = (task = null) => {
    setModalTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setModalTask(null);
    setIsModalOpen(false);
  };

  const filteredTasks = state.tasks.filter(task => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (task.title || '').toLowerCase().includes(search) ||
      (task.description || '').toLowerCase().includes(search) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(search)))
    );
  });

  const getFilteredColumn = (column) => ({
    ...column,
    taskIds: column.taskIds.filter(taskId => 
      filteredTasks.some(task => task.id === taskId)
    )
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => openModal()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Task
            </button>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}

           >
         
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

    {Object.values(state.columns).map(column => (
      <Column
        key={column.id}
        column={getFilteredColumn(column)}
        activeTaskId={activeTask ? activeTask.id : null}
        onEditTask={openModal}
      />
    ))}
  </div> 

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} /> : null}
          </DragOverlay>
        </DndContext>

        <TaskModal
          task={modalTask}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </div>
  );
}
