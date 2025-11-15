

import { TaskProvider } from './context/TaskContext';
import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <TaskProvider>
      <KanbanBoard />
    </TaskProvider>
  );
}

export default App
