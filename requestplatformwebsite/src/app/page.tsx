'use client';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import TaskBoard from '@/components/TaskBoard';
import AddTaskModal from '@/components/AddTaskModal';
import { TaskItem, Subteam } from '@/lib/types';
import { useMemo, useState } from 'react';
import { useDatabase } from '@/lib/useDatabase';

export default function Page() {

  const [statusFilter, setStatusFilter] =
    useState<'All' | 'Completed' | 'Uncompleted'>('All');
  const [subteamFilter, setSubteamFilter] =
    useState<Subteam | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  const { tasks, upsertTask, toggleTask, deleteTask } = useDatabase();

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return tasks.filter((t) => {
      if (statusFilter === 'Completed' && !t.completed) return false;
      if (statusFilter === 'Uncompleted' && t.completed) return false;

      if (subteamFilter !== 'All' && t.subteam !== subteamFilter) return false;

      if (!q) return true;
      const haystack = [
        t.title,
        t.description || '',
        t.assignee || '',
        t.subteam,
        t.priority,
        t.dueDate || '',
        new Date(t.createdAt).toLocaleDateString(),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [tasks, statusFilter, subteamFilter, searchQuery]);

  const handleUpsert = async (
    payload: Omit<TaskItem, 'id' | 'createdAt' | 'completed'> & { id?: string }
  ) => {
    await upsertTask(payload);
    setOpen(false);
    setEditing(null);
  };


  return (
    <>
      <Navbar onAddTask={() => { setEditing(null); setOpen(true); }} />

      <section id="home" style={{ padding: '24px 0' }}>
        <div className="container">
          <h1>Welcome</h1>
          <p>
            Use the Tasks tab to view and manage tasks. Filter by status, subteam, or use the
            search box to find tasks across all columns (Uncompleted–Unassigned, Uncompleted–Assigned, Completed).
          </p>
        </div>
      </section>

      <section id="tasks" style={{ padding: '24px 0' }}>
        <div className="container">
          <h2>Tasks</h2>

          <FilterBar
            statusFilter={statusFilter}
            subteamFilter={subteamFilter}
            searchQuery={searchQuery}
            onStatusChange={setStatusFilter}
            onSubteamChange={setSubteamFilter}
            onSearchChange={setSearchQuery}
          />

          <TaskBoard
            tasks={filteredTasks}
            onToggle={(id: string) => {
              const t = filteredTasks.find(x => x.id === id)
                ?? /* fall back to full set if filtered out */ tasks.find(x => x.id === id);

              if (!t) {
                console.error(`Task with id "${id}" not found when toggling completion.`);
              }
              const next = t ? !t.completed : true; // default to true if not found
              toggleTask(id, next).catch(console.error);
            }}
            onEdit={(t) => { setEditing(t); setOpen(true); }}
            onDelete={deleteTask}
          />
        </div>
      </section>

      <section id="help" style={{ padding: '24px 0' }}>
        <div className="container">
          <h2>Help</h2>
          <p>Quick guide on using the task platform:</p>
          <div>
            <ol>
              <li>Click <em>Add Task</em> in the navbar to create a task.</li>
              <li>Use <strong>Status</strong>, <strong>Subteam</strong>, and <strong>Search</strong> to narrow tasks.</li>
              <li>Click a task’s <em>Complete</em> button to toggle completion.</li>
              <li>Use <em>Edit</em> or <em>Delete</em> on a task card to modify or remove it.</li>
            </ol>
          </div>
        </div>
      </section>

      <AddTaskModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={handleUpsert}
        editing={editing}
      />
    </>
  );
}
