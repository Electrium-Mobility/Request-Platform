"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";
import { TaskItem, Subteam, Priority } from "./types";

type UpsertPayload = Omit<TaskItem, "id" | "createdAt" | "completed"> & {
  id?: string;
  completed?: boolean;
};

function dbToTask(row: any): TaskItem {
  // Handle joined user data if present (could be under 'user' or aliased)
  let assigneeName = undefined;
  // Check if 'user' is an object (joined) or array
  const userData = Array.isArray(row.user) ? row.user[0] : row.user;

  if (userData && userData.username) {
    assigneeName = userData.username;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    subteam: row.subteam as Subteam,
    priority: (row.priority || "Low") as Priority,
    assignee: assigneeName,
    assigneeId: row.assignee_id ?? undefined,
    dueDate: row.dueDate ?? undefined, // Matches quoted "dueDate" in DB
    completed: row.completed,
    archived: row.archived ?? false,
    createdAt: row.createdAt, // Matches quoted "createdAt" in DB
  };
}

export function useDatabase() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to fetch a single task with relations
  const fetchSingleTask = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("TaskItem")
      .select("*, user(username)")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return dbToTask(data);
  }, []);

  // Fetch all tasks initially
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("TaskItem")
      .select("*, user(username)")
      .order("createdAt", { ascending: false });

    if (error) {
      console.error("[fetchTasks]", error);
      setLoading(false);
      return;
    }

    setTasks((data ?? []).map(dbToTask));
    setLoading(false);
  }, []);

  // Handle live updates
  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "TaskItem" },
        async (payload) => {
          // Fetch the full task to get the joined username
          const newTask = await fetchSingleTask(payload.new.id);
          if (newTask) {
            setTasks((prev) => {
              if (prev.find((t) => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "TaskItem" },
        async (payload) => {
          // Fetch the full task to get the joined username
          const updatedTask = await fetchSingleTask(payload.new.id);
          if (updatedTask) {
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "TaskItem" },
        (payload) => {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks, fetchSingleTask]);

  // Batch update multiple tasks
  const batchUpdateTasks = useCallback(
    async (
      ids: string[],
      update: { completed?: boolean; subteam?: Subteam; priority?: Priority }
    ) => {
      if (ids.length === 0) return;

      // Store previous state for rollback
      // Use a function to get current tasks to avoid stale closure if we used 'tasks' dependency
      // But since we are inside a hook, we need to be careful.
      // We'll rely on 'setTasks' functional update for state, but for rollback we need the data.
      // To simplify, we'll just use optimistic updates and refetch if error, or just accept 'tasks' as dependency.
      // Given 'tasks' changes often, we might want to optimize, but for now adding 'tasks' to dependency array is correct.

      const previousTasks = tasks.filter((t) => ids.includes(t.id));

      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, ...update } : t))
      );

      const dbUpdate: Partial<
        Pick<TaskItem, "completed" | "subteam" | "priority">
      > = {};
      if (update.completed !== undefined) dbUpdate.completed = update.completed;
      if (update.subteam !== undefined) dbUpdate.subteam = update.subteam;
      if (update.priority !== undefined) dbUpdate.priority = update.priority;

      const { error } = await supabase
        .from("TaskItem")
        .update(dbUpdate)
        .in("id", ids);

      if (error) {
        console.error("[batchUpdateTasks]", error);
        // Rollback on error
        setTasks((prev) =>
          prev.map((t) => {
            const prevTask = previousTasks.find((pt) => pt.id === t.id);
            return prevTask || t;
          })
        );
        throw error;
      }
    },
    [tasks]
  );

  // Create or update tasks
  const upsertTask = useCallback(async (payload: UpsertPayload) => {
    // Optimistic update
    const tempId = payload.id ?? crypto.randomUUID();
    const tempTask: TaskItem = {
      id: tempId,
      title: payload.title,
      description: payload.description ?? undefined,
      subteam: payload.subteam,
      priority: payload.priority,
      assignee: payload.assignee ?? undefined, // Display name
      dueDate: payload.dueDate ?? undefined,
      completed: payload.completed ?? false,
      createdAt: new Date().toISOString(),
    };

    if (payload.id) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === payload.id
            ? {
                ...t,
                ...tempTask,
                completed: payload.completed ?? t.completed,
                createdAt: t.createdAt,
              }
            : t
        )
      );
    } else {
      setTasks((prev) => [tempTask, ...prev]);
    }

    // Resolve Assignee Name -> ID
    let assigneeId = null;
    if (payload.assignee && payload.assignee.trim()) {
      const name = payload.assignee.trim();
      // 1. Try to find user
      const { data: existingUser } = await supabase
        .from("user")
        .select("id")
        .eq("username", name)
        .single();

      if (existingUser) {
        assigneeId = existingUser.id;
      } else {
        // 2. Try to select again to ensure no race condition
        // If still not found, insert
        // Ideally we should rely on DB constraint, but here we double check
        const { data: retryUser } = await supabase
          .from("user")
          .select("id")
          .eq("username", name)
          .single();

        if (retryUser) {
          assigneeId = retryUser.id;
        } else {
          // 3. Create user if not exists
          const { data: newUser, error: createError } = await supabase
            .from("user")
            .insert({ username: name })
            .select("id")
            .single();

          if (!createError && newUser) {
            assigneeId = newUser.id;
          } else {
            // If insert failed, it might be because another client inserted it just now
            // (assuming unique constraint exists or will be added)
            // Try fetching one last time
            const { data: finalUser } = await supabase
              .from("user")
              .select("id")
              .eq("username", name)
              .single();

            if (finalUser) {
              assigneeId = finalUser.id;
            } else {
              console.error(
                "[upsertTask] Failed to create or find user:",
                createError
              );
            }
          }
        }
      }
    }

    const dbPayload: any = {
      title: payload.title,
      description: payload.description ?? null,
      subteam: payload.subteam,
      priority: payload.priority,
      dueDate: payload.dueDate ?? null,
      assignee_id: assigneeId,
    };
    if (payload.completed !== undefined) {
      dbPayload.completed = payload.completed;
    }

    if (payload.id) {
      // UPDATE
      const { error } = await supabase
        .from("TaskItem")
        .update(dbPayload)
        .eq("id", payload.id);

      if (error) {
        console.error("[updateTask]", error);
        // Revert optimistic update? For now just log
        throw error;
      }
    } else {
      // INSERT
      const { data, error } = await supabase
        .from("TaskItem")
        .insert({
          ...dbPayload,
          completed: payload.completed ?? false,
        })
        .select("*, user(username)")
        .single();

      if (error) {
        console.error("[insertTask]", error);
        setTasks((prev) => prev.filter((t) => t.id !== tempId)); // Remove temp task on error
        throw error;
      } else {
        // Replace temp task with real one (with real ID and relations)
        const inserted = dbToTask(data);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? inserted : t)));
      }
    }
  }, []);

  // Complete Task
  const toggleTask = useCallback(async (id: string, nextCompleted: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );
    const { error } = await supabase
      .from("TaskItem")
      .update({ completed: nextCompleted })
      .eq("id", id);
    if (error) {
      console.error("[toggleTask]", error);
      throw error;
    }
  }, []);

  // Archive Task
  const archiveTask = useCallback(async (id: string, archived: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived } : t)));

    const { error } = await supabase
      .from("TaskItem")
      .update({ archived })
      .eq("id", id);

    if (error) {
      console.error("[archiveTask]", error);
      throw error;
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id)); // remove immediately
    const { error } = await supabase.from("TaskItem").delete().eq("id", id);
    if (error) {
      console.error("[deleteTask]", error);
      throw error;
    }
  }, []);

  return {
    tasks,
    loading,
    upsertTask,
    toggleTask,
    deleteTask,
    archiveTask,
    batchUpdateTasks,
  };
}
