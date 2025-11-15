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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          <button
            onClick={() => openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add Task
          </button>
        </div>

        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(state.columns).map(column => (
              <Column
                key={column.id}
                column={column}
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