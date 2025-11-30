"use client";
import styles from "@/styles/Modal.module.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TaskItem, Priority, Subteam } from "@/lib/types";

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

  const [userOptions, setUserOptions] = useState<{ id: string; username: string }[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => setToastVisible(false), 3000);
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

    const fetchUsers = async () => {
      if (!open) return;
      // Try multiple possible table names
      const attempts: { table: string; select: string; map: (r: any) => { id: string; username: string } }[] = [
        { table: "user", select: "id, username", map: (r) => ({ id: r.id, username: r.username }) },
        { table: "users", select: "id, username", map: (r) => ({ id: r.id, username: r.username }) },
        { table: "profiles", select: "id, full_name", map: (r) => ({ id: r.id, username: r.full_name }) },
      ];
      for (const attempt of attempts) {
        const { data, error } = await supabase.from(attempt.table).select(attempt.select).limit(100);
        if (!error && data && data.length) {
          const mapped = data.map(attempt.map).filter((u) => u.username && u.username.trim());
          setUserOptions(mapped);
          if (editing?.assignee && editing.assignee.trim() && !mapped.find((u) => u.username === editing.assignee)) {
            setUserOptions((prev) => [...prev, { id: "editing-temp", username: editing.assignee!.trim() }]);
          }
          return;
        }
      }
      // fallback empty
      setUserOptions((prev) => {
        if (editing?.assignee && editing.assignee.trim()) {
          return [{ id: "editing-temp", username: editing.assignee.trim() }];
        }
        return prev;
      });
    };
    fetchUsers();
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

    if (taskData.dueDate) {
      const today = new Date();
      const selected = new Date(taskData.dueDate + "T00:00:00");
      const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (selected < todayMid) {
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
        <div style={{ position: "relative", marginBottom: "0.75rem", minHeight: "1.75rem" }}>
          <h2 style={{ margin: 0 }}>{editing ? "Edit Task" : "Add Task"}</h2>
          {toastVisible && toastMsg && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)", /* center horizontally only */
                background: "#ff4444",
                color: "#fff",
                padding: "0.4rem 0.75rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                animation: "fadeIn 0.15s ease",
              }}
            >
              {toastMsg}
            </div>
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
