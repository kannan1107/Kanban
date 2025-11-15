import { createContext, useContext, useReducer, useEffect } from 'react';

const TaskContext = createContext();

const initialState = {
  tasks: [],
  columns: {
    'todo': { id: 'todo', title: 'To Do', taskIds: [] },
    'inprogress': { id: 'inprogress', title: 'In Progress', taskIds: [] },
    'done': { id: 'done', title: 'Done', taskIds: [] }
  }
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'LOAD_TASKS':
      return action.payload;
    case 'ADD_TASK':
      const newTask = { ...action.payload, id: Date.now().toString() };
      return {
        ...state,
        tasks: [...state.tasks, newTask],
        columns: {
          ...state.columns,
          [newTask.status]: {
            ...state.columns[newTask.status],
            taskIds: [...state.columns[newTask.status].taskIds, newTask.id]
          }
        }
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
    case 'DELETE_TASK':
      const taskToDelete = state.tasks.find(t => t.id === action.payload);
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        columns: {
          ...state.columns,
          [taskToDelete.status]: {
            ...state.columns[taskToDelete.status],
            taskIds: state.columns[taskToDelete.status].taskIds.filter(id => id !== action.payload)
          }
        }
      };
    case 'MOVE_TASK':
      const { taskId, sourceColumn, destinationColumn, destinationIndex } = action.payload;
      
      return {
        ...state,
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, status: destinationColumn } : t
        ),
        columns: {
          ...state.columns,
          [sourceColumn]: {
            ...state.columns[sourceColumn],
            taskIds: state.columns[sourceColumn].taskIds.filter(id => id !== taskId)
          },
          [destinationColumn]: {
            ...state.columns[destinationColumn],
            taskIds: [
              ...state.columns[destinationColumn].taskIds.slice(0, destinationIndex),
              taskId,
              ...state.columns[destinationColumn].taskIds.slice(destinationIndex)
            ]
          }
        }
      };
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem('kanban-tasks');
    if (saved) {
      dispatch({ type: 'LOAD_TASKS', payload: JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanban-tasks', JSON.stringify(state));
  }, [state]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTask = () => useContext(TaskContext);