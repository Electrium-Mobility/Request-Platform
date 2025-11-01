import { useDrop } from 'react-dnd';
import { TaskCard } from './TaskCard';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  tags?: string[];
  likes?: number;
  comments?: number;
  attachments?: number;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDrop: (taskId: string, sourceColumnId: string, targetColumnId: string) => void;
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  accentColor?: string;
  icon?: React.ReactNode;
}

export function KanbanColumn({ id, title, tasks, onDrop, color, bgColor, borderColor, hoverColor, accentColor, icon }: KanbanColumnProps) {
  const [{ isOver }, drop] = useDrop({
    accept: 'TASK',
    drop: (item: { id: string; columnId: string }) => {
      if (item.columnId !== id) {
        onDrop(item.id, item.columnId, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div className="flex flex-col min-w-[300px] w-full">
      <div className={`mb-3 px-4 py-3 rounded-xl ${bgColor} backdrop-blur-xl border ${borderColor} shadow-lg transition-all hover:shadow-xl`}>
        <div className="flex items-center gap-2 mb-1">
          {icon && (
            <div className={`p-1.5 bg-gradient-to-br ${accentColor} rounded-lg shadow-md`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          )}
          <h2 className={`${color} flex-1`}>{title}</h2>
          <div className={`px-2 py-0.5 rounded-full ${bgColor} border ${borderColor} backdrop-blur-sm`}>
            <span className={`text-xs ${color}`}>{tasks.length}</span>
          </div>
        </div>
      </div>
      <div
        ref={drop}
        className={`min-h-[500px] max-h-[calc(100vh-220px)] ${bgColor} backdrop-blur-xl rounded-xl p-3 space-y-2.5 transition-all border ${borderColor} overflow-y-auto ${
          isOver ? `${hoverColor} ring-2 ring-purple-500/50 ring-offset-2 ring-offset-transparent scale-[1.01] shadow-2xl shadow-purple-500/20` : 'shadow-lg'
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            columnId={id}
            priority={task.priority}
            dueDate={task.dueDate}
            assignee={task.assignee}
            tags={task.tags}
            likes={task.likes}
            comments={task.comments}
            attachments={task.attachments}
          />
        ))}
        {tasks.length === 0 && (
          <div className={`text-center ${color} opacity-40 py-12 text-sm`}>
            <div className="mb-2 opacity-50">
              <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
