'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { TaskItem, Subteam, Priority } from './types';

type UpsertPayload = Omit<TaskItem, 'id' | 'createdAt' | 'completed'> & { id?: string };

function dbToTask(row: any): TaskItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    subteam: row.subteam as Subteam,
    priority: row.priority as Priority,
    assignee: row.assignee ?? undefined,
    dueDate: row.due_date ?? undefined,
    completed: row.completed,
    archived: row.archived ?? false,
    createdAt: row.created_at,
  };
}

export function useDatabase() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tasks initially
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[fetchTasks]', error);
      setLoading(false);
      return;
    }

    setTasks((data ?? []).map(dbToTask));
    setLoading(false);
  }, []);

  //Handle live updates
  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        const newTask = dbToTask(payload.new);
        // Only add if not already in the list
        setTasks(prev => {
          if (prev.find(t => t.id === newTask.id)) return prev;
          return [newTask, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        const updatedTask = dbToTask(payload.new);
        setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
        setTasks(prev => prev.filter(t => t.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  //Create or update tasks
  const upsertTask = useCallback(async (payload: UpsertPayload) => {
    if (payload.id) {
      setTasks(prev => prev.map(t => 
        t.id === payload.id
          ? { ...t, ...payload }
          : t
      ));

      const { error } = await supabase
        .from('tasks')
        .update({
          title: payload.title,
          description: payload.description ?? null,
          subteam: payload.subteam,
          priority: payload.priority,
          due_date: payload.dueDate ?? null,
          assignee: payload.assignee ?? null,
        })
        .eq('id', payload.id);

      if (error) console.error('[updateTask]', error);
    } else {
      // Create a temporary local task for instant feedback
      const tempTask: TaskItem = {
        id: crypto.randomUUID(),
        title: payload.title,
        description: payload.description ?? undefined,
        subteam: payload.subteam,
        priority: payload.priority,
        assignee: payload.assignee ?? undefined,
        dueDate: payload.dueDate ?? undefined,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      setTasks(prev => [tempTask, ...prev]); 

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: payload.title,
          description: payload.description ?? null,
          subteam: payload.subteam,
          priority: payload.priority,
          due_date: payload.dueDate ?? null,
          assignee: payload.assignee ?? null,
          completed: false,
        })
        .select('*')
        .single();

      if (error) { //error handling
        console.error('[insertTask]', error);
        setTasks(prev => prev.filter(t => t.id !== tempTask.id));
      } else {
        // Replace temporary local task with database one
        const inserted = dbToTask(data);
        setTasks(prev =>
          prev.map(t => (t.id === tempTask.id ? inserted : t))
        );
      }
    }
  }, []);

  // Complete Task
  const toggleTask = useCallback(async (id: string, nextCompleted: boolean) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );
    const { error } = await supabase.from('tasks').update({ completed: nextCompleted }).eq('id', id);
    if (error) console.error('[toggleTask]', error);
  }, []);

  // Archive Task
  const archiveTask = useCallback(async (id: string, archived: boolean) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, archived } : t))
    );

    const { error } = await supabase
      .from('tasks')
      .update({ archived })
      .eq('id', id);

    if (error) console.error('[archiveTask]', error);
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id)); // remove immediately
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.error('[deleteTask]', error);
  }, []);

  return { tasks, loading, upsertTask, toggleTask, deleteTask, archiveTask };
}
