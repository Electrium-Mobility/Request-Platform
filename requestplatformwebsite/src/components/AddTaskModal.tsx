"use client";
import styles from "@/styles/Modal.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TaskItem, Priority, Subteam } from "@/lib/types";

const TOAST_DURATION_MS = 3000;

/*Double check all subteams are here later*/
const subteams: Subteam[] = [
  "Electrical",
  "Finance",
  "Firmware",
  "Management",
  "Marketing",
  "Mechanical",
  "Web Dev",
];
const priorities: Priority[] = ["Low", "Medium", "High"];

export default function AddTaskModal({
  open,
  onClose,
  onSubmit,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    task: Omit<TaskItem, "id" | "createdAt" | "completed"> & { id?: string }
  ) => void;
  editing?: TaskItem | null;
}) {
  const [taskData, setTaskData] = useState<
    Omit<TaskItem, "id" | "createdAt" | "completed"> & { id?: string }
  >({
    id: undefined,
    title: "",
    description: "",
    subteam: "Electrical",
    priority: "Low",
    dueDate: "",
    assignee: "",
  });

  const [userOptions, setUserOptions] = useState<
    { id: string; username: string }[]
  >([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Ensure dropdown does not show duplicate usernames (case/whitespace-insensitive)
  const dedupeUsers = (items: { id: string; username: string }[]) => {
    const seen = new Set<string>();
    const result: { id: string; username: string }[] = [];
    for (const u of items) {
      const key = (u.username || "").trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({ id: u.id, username: u.username.trim() });
    }
    return result;
  };

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), TOAST_DURATION_MS);
      return () => clearTimeout(t);
    }
  }, [toastVisible]);

  useEffect(() => {
    if (open && editing) {
      setTaskData({
        id: editing.id,
        title: editing.title,
        description: editing.description || "",
        subteam: editing.subteam,
        priority: editing.priority,
        dueDate: editing.dueDate || "",
        assignee: editing.assignee || "",
      });
    } else if (open && !editing) {
      setTaskData({
        id: undefined,
        title: "",
        description: "",
        subteam: "Electrical",
        priority: "Low",
        dueDate: "",
        assignee: "",
      });
    }

    let cancelled = false;
    const fetchUsers = async () => {
      if (!open) return;
      try {
        const { data, error } = await supabase
          .from("user")
          .select("id, username")
          .limit(100);
        if (cancelled) return;
        if (!error && data && data.length) {
          let mapped = data
            .map((r: any) => ({ id: r.id, username: r.username }))
            .filter((u) => u.username && u.username.trim());
          mapped = dedupeUsers(mapped);
          if (editing?.assignee && editing.assignee.trim()) {
            const assigneeKey = editing.assignee.trim().toLowerCase();
            if (
              !mapped.find(
                (u) => u.username.trim().toLowerCase() === assigneeKey
              )
            ) {
              mapped.push({
                id: `__temp_editing_assignee__:${assigneeKey}`,
                username: editing.assignee.trim(),
              });
            }
          }
          setUserOptions(mapped);
          return;
        }
        // If query returned empty or errored, fallback preserves existing + potential editing assignee
        setUserOptions((prev) => {
          let base = dedupeUsers(prev);
          if (editing?.assignee && editing.assignee.trim()) {
            const assigneeKey = editing.assignee.trim().toLowerCase();
            if (
              !base.find((u) => u.username.trim().toLowerCase() === assigneeKey)
            ) {
              base = [
                ...base,
                {
                  id: `__temp_editing_assignee__:${assigneeKey}`,
                  username: editing.assignee.trim(),
                },
              ];
            }
          }
          return base;
        });
      } catch (err) {
        if (!cancelled) {
          console.error("User fetch error", err);
        }
      }
    };
    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    if (taskData.dueDate) {
      // Compare ISO date strings to avoid timezone edge cases
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
      if (taskData.dueDate < todayStr) {
        setToastMsg("Due Date cannot be in the past.");
        setToastVisible(true);
        return;
      }
    }

    onSubmit({
      ...taskData,
      title: taskData.title.trim(),
      description: taskData.description?.trim() || undefined,
      dueDate: taskData.dueDate || undefined,
      assignee: taskData.assignee?.trim() || undefined,
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`panel ${styles.modal}`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideDown 0.25s ease both" }}
      >
        <div
          style={{
            position: "relative",
            marginBottom: "0.75rem",
            minHeight: "1.75rem",
          }}
        >
          <h2 style={{ margin: 0 }}>{editing ? "Edit Task" : "Add Task"}</h2>
          {toastVisible && toastMsg && (
            <div className={styles.toast}>{toastMsg}</div>
          )}
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Task Title</span>
            <input
              value={taskData.title}
              onChange={(e) =>
                setTaskData({ ...taskData, title: e.target.value })
              }
              placeholder="Task Name..."
              required
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              value={taskData.description}
              onChange={(e) =>
                setTaskData({ ...taskData, description: e.target.value })
              }
              placeholder="Optional details..."
            />
          </label>
          <div className={styles.row}>
            <label>
              <span>Subteam</span>
              <select
                value={taskData.subteam}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    subteam: e.target.value as Subteam,
                  })
                }
              >
                {subteams.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select
                value={taskData.priority}
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    priority: e.target.value as Priority,
                  })
                }
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.row}>
            <label style={{ cursor: "pointer" }}>
              <span>Due Date</span>
              <input
                type="date"
                value={taskData.dueDate}
                onClick={(e) => e.currentTarget.showPicker()}
                onChange={(e) =>
                  setTaskData({ ...taskData, dueDate: e.target.value })
                }
                style={{ cursor: "pointer" }}
              />
            </label>
            <label>
              <span>Assign To</span>
              <select
                value={taskData.assignee}
                onChange={(e) =>
                  setTaskData({ ...taskData, assignee: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {userOptions.map((u) => (
                  <option key={u.id} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={styles.actions}>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary">
              {editing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
