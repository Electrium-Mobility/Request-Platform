'use client';

/*
IMPORTANT: Make sure to adda .env.local following .env.example format 
(when deployed modify environment variables to make everything work properly)
*/
import { useSession, signOut } from "next-auth/react";
import { useMemo, useState, useEffect } from "react";
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import TaskBoard from '@/components/TaskBoard';
import AddTaskModal from '@/components/AddTaskModal';
import ArchivedSection from '@/components/ArchivedSection';
import { TaskItem, Subteam } from '@/lib/types';
import { useDatabase } from '@/lib/useDatabase';
import toast from 'react-hot-toast';

export default function Page() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Uncompleted'>('All');
  const [subteamFilter, setSubteamFilter] = useState<Subteam | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  const { tasks, upsertTask, toggleTask, deleteTask, archiveTask, batchUpdateTasks } = useDatabase();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const archivedTasks = useMemo(() => tasks.filter(t => t.archived), [tasks]);
  const activeTasks = useMemo(() => filteredTasks.filter(t => !t.archived), [filteredTasks]);

  const handleUpsert = async (
    payload: Omit<TaskItem, 'id' | 'createdAt' | 'completed'> & { id?: string }
  ) => {
    try {
      await upsertTask(payload);
      toast.success(payload.id ? 'Task updated' : 'Task created');
      setOpen(false);
      setEditing(null);
    } catch (err) {
      console.error('[handleUpsert]', err);
      toast.error('Failed to save task');
    }
  };

  const handleArchive = async (id: string, archived: boolean) => {
    try {
      await archiveTask(id, archived);
      toast.success(archived ? 'Task archived' : 'Task unarchived');
    } catch (err) {
      console.error('[handleArchive]', err);
      toast.error('Failed to change archive state');
    }
  };

  // Wait for hydration
  if (!mounted || status === "loading") {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  // Main authenticated dashboard (middleware ensures only logged-in users reach this)
  return (
    <>
      <Navbar onAddTask={() => { setEditing(null); setOpen(true); }} />

      {session?.user && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem",
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid #e2e2e2",
            backgroundColor: "#fafafa",
          }}
        >
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={32}
              height={32}
              style={{ borderRadius: "50%" }}
            />
          )}
          <span>{session.user.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              background: "transparent",
              border: "1px solid #ccc",
              borderRadius: 6,
              padding: "0.25rem 0.75rem",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </div>
      )}

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
              toggleTask(id, next)
                .then(() => toast.success(next ? 'Marked complete' : 'Marked uncompleted'))
                .catch((err) => {
                  console.error('[toggleTask]', err);
                  toast.error('Failed to toggle');
                });
            }}
            onEdit={(t) => { setEditing(t); setOpen(true); }}
            onDelete={(id) => {
              deleteTask(id)
                .then(() => toast.success('Task deleted'))
                .catch((err) => {
                  console.error('[deleteTask]', err);
                  toast.error('Failed to delete task');
                });
            }}
            onArchive={handleArchive}
            onBatchUpdate={batchUpdateTasks}
            onUpdate={upsertTask}
          />

          <ArchivedSection
            tasks={archivedTasks}
            onArchive={handleArchive}
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
              <li>Click a task's <em>Complete</em> button to toggle completion.</li>
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