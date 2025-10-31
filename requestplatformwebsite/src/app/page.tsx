'use client';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import TaskBoard from '@/components/TaskBoard';
import AddTaskModal from '@/components/AddTaskModal';
import ArchivedSection from '@/components/ArchivedSection';
import { TaskItem, Subteam } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { useDatabase } from '@/lib/useDatabase';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Uncompleted'>('All');
  const [subteamFilter, setSubteamFilter] = useState<Subteam | 'All'>('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  useEffect(() => { setMounted(true); }, []);
  const { tasks, loading, upsertTask, toggleTask, deleteTask, archiveTask } = useDatabase();

  const filtered = useMemo(() => {
    let result = tasks;
    if (statusFilter === 'Completed') result = result.filter(t => t.completed);
    else if (statusFilter === 'Uncompleted') result = result.filter(t => !t.completed);
    if (subteamFilter !== 'All') result = result.filter(t => t.subteam === subteamFilter);
    return result;
  }, [tasks, statusFilter, subteamFilter]);

  const archivedTasks = useMemo(() => tasks.filter(t => t.archived), [tasks]);
  const activeTasks = useMemo(() => filtered.filter(t => !t.archived), [filtered]);

  const handleUpsert = async (payload: Omit<TaskItem, 'id' | 'createdAt' | 'completed'> & { id?: string }) => {
    await upsertTask(payload);
    setEditing(null);
    setOpen(false);
  };

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    await toggleTask(id, !task.completed);
  };

  const handleEdit = (t: TaskItem) => { setEditing(t); setOpen(true); };
  const handleDelete = async (id: string) => { await deleteTask(id); };

  const handleArchive = async (id: string, archived: boolean) => {
    await archiveTask(id, archived);
  };

  if (!mounted || loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <>
      <Navbar onAddTask={() => { setEditing(null); setOpen(true); }} />
      <section id="home" style={{ minHeight: '90vh', display: 'grid', placeItems: 'center', paddingTop: 72 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>
            Electrium Mobility Task Management Platform
          </h1>
          <p style={{ maxWidth: 720, margin: '0 auto 22px' }}>
            Start by picking up or requesting a task! (Shared across all users)
          </p>
        </div>
      </section>

      <section id="tasks" style={{ padding: '40px 0' }}>
        <div className="container">
          <h2 style={{ margin: '8px 0 16px' }}>Tasks Dashboard</h2>
          <FilterBar 
            statusFilter={statusFilter}
            subteamFilter={subteamFilter}
            onStatusChange={setStatusFilter}
            onSubteamChange={setSubteamFilter}
          />
          <TaskBoard
            tasks={filtered}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
          />

          <ArchivedSection
            tasks={archivedTasks}
            onArchive={handleArchive}
            onDelete={handleDelete}
          />
        </div>
      </section>

      <section id="help" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="panel" style={{ padding: 18 }}>
            <h2>How It Works</h2>
            <ol style={{ color: 'var(--text-2)' }}>
              <li>Click <strong>Add Task</strong> to create a new one.</li>
              <li>Tasks instantly sync across all browsers.</li>
              <li>Anyone can edit, complete, or delete any task.</li>
              <li>Perfect for shared team testing!</li>
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
