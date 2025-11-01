import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { KanbanColumn, Task } from './components/KanbanColumn';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Plus, Sparkles, Moon, Zap } from 'lucide-react';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
  accentColor: string;
  icon: React.ReactNode;
}

export default function App() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      color: 'text-gray-300',
      bgColor: 'bg-gray-800/50',
      borderColor: 'border-gray-600/50',
      hoverColor: 'bg-gray-700/50',
      accentColor: 'from-gray-500 to-gray-600',
      icon: <Moon className="w-4 h-4" />,
      tasks: [
        { 
          id: '8', 
          title: 'Mobile app development', 
          description: 'Explore React Native for mobile version', 
          priority: 'low',
          assignee: { name: 'Pat Wilson', avatar: '' },
          tags: ['mobile', 'future'],
          likes: 3,
          comments: 2,
          attachments: 0
        },
        { 
          id: '9', 
          title: 'Email notification system', 
          description: 'Send automated emails for task updates', 
          priority: 'medium',
          assignee: { name: 'Sam Brown', avatar: '' },
          tags: ['feature', 'backend'],
          likes: 7,
          comments: 4,
          attachments: 1
        },
        { 
          id: '10', 
          title: 'Dark mode theme', 
          description: 'Add dark mode toggle and styling', 
          priority: 'low',
          dueDate: '2025-12-01',
          assignee: { name: 'Riley Jones', avatar: '' },
          tags: ['ui', 'enhancement'],
          likes: 18,
          comments: 9,
          attachments: 2
        },
        { 
          id: '11', 
          title: 'Performance optimization', 
          description: 'Improve load times and bundle size', 
          priority: 'medium',
          assignee: { name: 'Casey Miller', avatar: '' },
          tags: ['performance', 'technical'],
          likes: 4,
          comments: 2,
          attachments: 0
        },
      ],
    },
    {
      id: 'todo',
      title: 'To Do',
      color: 'text-purple-300',
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-500/50',
      hoverColor: 'bg-purple-800/40',
      accentColor: 'from-purple-500 to-pink-500',
      icon: <Sparkles className="w-4 h-4" />,
      tasks: [
        { 
          id: '1', 
          title: 'Design landing page', 
          description: 'Create wireframes and mockups for the new landing page', 
          priority: 'high',
          dueDate: '2025-11-05',
          assignee: { name: 'Sarah Chen', avatar: '' },
          tags: ['design', 'ui/ux'],
          likes: 5,
          comments: 3,
          attachments: 2
        },
        { 
          id: '2', 
          title: 'Set up project repository', 
          description: 'Initialize Git repo and configure CI/CD', 
          priority: 'medium',
          dueDate: '2025-11-02',
          assignee: { name: 'Mike Johnson', avatar: '' },
          tags: ['devops', 'setup'],
          likes: 2,
          comments: 1,
          attachments: 0
        },
        { 
          id: '3', 
          title: 'Research competitor features', 
          description: 'Analyze top 5 competitors', 
          priority: 'low',
          dueDate: '2025-11-10',
          assignee: { name: 'Emma Davis', avatar: '' },
          tags: ['research', 'analysis'],
          likes: 8,
          comments: 5,
          attachments: 4
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: 'text-blue-300',
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-500/50',
      hoverColor: 'bg-blue-800/40',
      accentColor: 'from-blue-500 to-cyan-500',
      icon: <Zap className="w-4 h-4" />,
      tasks: [
        { 
          id: '4', 
          title: 'Implement authentication', 
          description: 'Add login and signup functionality', 
          priority: 'high',
          dueDate: '2025-11-03',
          assignee: { name: 'Alex Kim', avatar: '' },
          tags: ['backend', 'security'],
          likes: 12,
          comments: 8,
          attachments: 1
        },
        { 
          id: '5', 
          title: 'Build API endpoints', 
          description: 'Create REST API for user management', 
          priority: 'medium',
          dueDate: '2025-11-07',
          assignee: { name: 'Chris Lee', avatar: '' },
          tags: ['backend', 'api'],
          likes: 6,
          comments: 4,
          attachments: 3
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: 'text-green-300',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-500/50',
      hoverColor: 'bg-green-800/40',
      accentColor: 'from-green-500 to-emerald-500',
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>,
      tasks: [
        { 
          id: '6', 
          title: 'Project kickoff meeting', 
          description: 'Align team on goals and timeline', 
          priority: 'medium',
          dueDate: '2025-10-28',
          assignee: { name: 'Taylor Swift', avatar: '' },
          tags: ['planning', 'meeting'],
          likes: 15,
          comments: 12,
          attachments: 2
        },
        { 
          id: '7', 
          title: 'Define user personas', 
          description: 'Create 3 primary user personas', 
          priority: 'low',
          dueDate: '2025-10-30',
          assignee: { name: 'Jordan Smith', avatar: '' },
          tags: ['ux', 'research'],
          likes: 9,
          comments: 6,
          attachments: 5
        },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assigneeName: '',
    tags: ''
  });
  const [selectedColumn, setSelectedColumn] = useState('backlog');

  const handleDrop = (taskId: string, sourceColumnId: string, targetColumnId: string) => {
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId);
      const targetColumn = newColumns.find((col) => col.id === targetColumnId);

      if (sourceColumn && targetColumn) {
        const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
        if (taskIndex !== -1) {
          const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
          targetColumn.tasks.push(movedTask);
        }
      }

      return newColumns;
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined,
      assignee: newTask.assigneeName ? { name: newTask.assigneeName, avatar: '' } : undefined,
      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()) : [],
      likes: 0,
      comments: 0,
      attachments: 0
    };

    setColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      const column = newColumns.find((col) => col.id === selectedColumn);
      if (column) {
        column.tasks.push(task);
      }
      return newColumns;
    });

    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assigneeName: '', tags: '' });
    setIsDialogOpen(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-6 relative overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-white mb-2 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Project Board
                </span>
              </h1>
              <p className="text-gray-400 text-sm ml-14">Organize, track, and manage your workflow</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-700/50 text-white shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                    Add New Task
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddTask} className="space-y-3 mt-4">
                  <div>
                    <Label htmlFor="column" className="text-sm text-gray-300">Column</Label>
                    <select
                      id="column"
                      value={selectedColumn}
                      onChange={(e) => setSelectedColumn(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 bg-gray-800/50 backdrop-blur border border-gray-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {columns.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="priority" className="text-sm text-gray-300">Priority</Label>
                    <select
                      id="priority"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="w-full mt-1.5 px-3 py-2 bg-gray-800/50 backdrop-blur border border-gray-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="title" className="text-sm text-gray-300">Title</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      required
                      className="mt-1.5 bg-gray-800/50 backdrop-blur border-gray-600/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-sm text-gray-300">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Enter task description"
                      className="mt-1.5 bg-gray-800/50 backdrop-blur border-gray-600/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate" className="text-sm text-gray-300">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="mt-1.5 bg-gray-800/50 backdrop-blur border-gray-600/50 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignee" className="text-sm text-gray-300">Assignee</Label>
                    <Input
                      id="assignee"
                      value={newTask.assigneeName}
                      onChange={(e) => setNewTask({ ...newTask, assigneeName: e.target.value })}
                      placeholder="Enter assignee name"
                      className="mt-1.5 bg-gray-800/50 backdrop-blur border-gray-600/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags" className="text-sm text-gray-300">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newTask.tags}
                      onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                      placeholder="e.g. design, frontend, urgent"
                      className="mt-1.5 bg-gray-800/50 backdrop-blur border-gray-600/50 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-gray-600/50 text-gray-300 hover:bg-gray-800/50 backdrop-blur"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/30">
                      Add Task
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={column.tasks}
                onDrop={handleDrop}
                color={column.color}
                bgColor={column.bgColor}
                borderColor={column.borderColor}
                hoverColor={column.hoverColor}
                accentColor={column.accentColor}
                icon={column.icon}
              />
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
