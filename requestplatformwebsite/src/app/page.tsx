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
import { TaskItem, Subteam } from '@/lib/types';
import { useDatabase } from '@/lib/useDatabase';

export default function Page() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Uncompleted'>('All');
  const [subteamFilter, setSubteamFilter] = useState<Subteam | 'All'>('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  const { tasks, upsertTask, toggleTask, deleteTask } = useDatabase();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let result = tasks;
    if (statusFilter === 'Completed') result = result.filter(t => t.completed);
    else if (statusFilter === 'Uncompleted') result = result.filter(t => !t.completed);
    if (subteamFilter !== 'All') result = result.filter(t => t.subteam === subteamFilter);
    return result;
  }, [tasks, statusFilter, subteamFilter]);

  const handleUpsert = async (payload: Omit<TaskItem, 'id' | 'createdAt' | 'completed'> & { id?: string }) => {
    await upsertTask(payload);
    setEditing(null);
    setOpen(false);
  };

  const handleToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) await toggleTask(id, !task.completed);
  };

  const handleEdit = (t: TaskItem) => {
    setEditing(t);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
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

      <section
        id="home"
        style={{
          minHeight: '90vh',
          display: 'grid',
          placeItems: 'center',
          paddingTop: 72,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>
            Electrium Mobility Task Management Platform
          </h1>
          <p style={{ maxWidth: 720, margin: '0 auto 22px' }}>
            Start by picking up or requesting a task!
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
          />
        </div>
      </section>

      <section id="help" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="panel" style={{ padding: 18 }}>
            <h2>How It Works</h2>
            <ol style={{ color: 'var(--text-2)' }}>
              <li>
                Click <strong>Add Task</strong> to create a new one.
              </li>
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
