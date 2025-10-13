'use client';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import TaskBoard from '@/components/TaskBoard';
import AddTaskModal from '@/components/AddTaskModal';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { TaskItem, Subteam } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Uncompleted'>('All');
  const [subteamFilter, setSubteamFilter] = useState<Subteam | 'All'>('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*Using local storage for now will change to supabase or something later*/
  const [tasks, setTasks] = useLocalStorage<TaskItem[]>('uw-tasks', []);

  const generateId = () =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  useEffect(() => {
    if (!mounted) return;
    
    setTasks(prev => {
      const seen = new Set<string>();
      let needsUpdate = false;
      
      const updated = prev.map(t => {
        let id = t.id;
        if (!id || seen.has(id)) {
          id = generateId();
          needsUpdate = true;
        }
        seen.add(id);
        return { ...t, id };
      });
      
      return needsUpdate ? updated : prev;
    });
  }, [mounted]);

  const filtered = useMemo(() => {
    let result = tasks;

    // Filter by status
    if (statusFilter === 'Completed') {
      result = result.filter(t => t.completed);
    } else if (statusFilter === 'Uncompleted') {
      result = result.filter(t => !t.completed);
    }

    // Filter by subteam
    if (subteamFilter !== 'All') {
      result = result.filter(t => t.subteam === subteamFilter);
    }

    return result;
  }, [tasks, statusFilter, subteamFilter]);

  //Update + Insert task
  const upsertTask = (
    payload: Omit<TaskItem, 'id' | 'createdAt' | 'completed'> & { id?: string }
  ) => {
    if (payload.id) {
      setTasks(prev =>
        prev.map(t => 
          t.id === payload.id 
            ? { 
                ...t, 
                title: payload.title,
                description: payload.description,
                subteam: payload.subteam,
                priority: payload.priority,
                dueDate: payload.dueDate,
                assignee: payload.assignee
              }
            : t
        )
      );
    } else {
      // Creating new task
      const newTask: TaskItem = {
        id: generateId(),
        createdAt: Date.now(),
        completed: false,
        title: payload.title,
        description: payload.description,
        subteam: payload.subteam,
        priority: payload.priority,
        dueDate: payload.dueDate,
        assignee: payload.assignee,
      };
      setTasks(prev => [newTask, ...prev]);
    }
    
    setEditing(null);
    setOpen(false);
  };

  /*Completing task*/
  const toggleTask = (id: string) =>
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );

  const editTask = (t: TaskItem) => {
    setEditing(t);
    setOpen(true);
  };

  const deleteTask = (id: string) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  /*Shows loading message if necessary*/
  if (!mounted) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <>
      <Navbar onAddTask={() => { setEditing(null); setOpen(true); }} />

      <section
        id="home"
        style={{
          minHeight: '90vh',
          display: 'grid',
          placeItems: 'center',
          paddingTop: 72,
        }}
      >
        {/*Fix background of this section later looks weird*/}
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
            onToggle={toggleTask}
            onEdit={editTask}
            onDelete={deleteTask}
          />
        </div>
      </section>

      <section id="help" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="panel" style={{ padding: 18 }}>
            <h2>How It Works</h2>
            <ol style={{ color: 'var(--text-2)' }}>
              <li>Use the <strong>Add Task</strong> button to create a new task.</li>
              <li>Select your subteam, priority, and optionally assign someone.</li>
              <li>View tasks under <em>Uncompleted</em> or <em>Completed</em> panels.</li>
              <li>Each task's Complete/Edit/Delete buttons only affect that one task.</li>
            </ol>
          </div>
        </div>
      </section>

      <AddTaskModal
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        onSubmit={upsertTask}
        editing={editing}
      />
    </>
  );
}