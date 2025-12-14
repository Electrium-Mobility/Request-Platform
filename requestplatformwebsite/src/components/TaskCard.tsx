"use client";
import { useState } from "react";
import styles from "@/styles/TaskCard.module.css";
import checkboxStyles from "@/styles/BatchSelectCheckbox.module.css";
import { TaskItem } from "@/lib/types";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import toast from "react-hot-toast";

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M20.285 6.709a1 1 0 0 1 0 1.414l-9.192 9.192a1 1 0 0 1-1.414 0L3.715 11.55a1 1 0 1 1 1.414-1.415l5.05 5.051 8.485-8.477a1 1 0 0 1 1.621 0Z" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm18.71-11.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.99-1.66Z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 7h2v8h-2v-8Zm4 0h2v8h-2v-8ZM6 10h2v8H6v-8Z" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M3 3h18v4H3V3Zm2 6h14v12H5V9Zm7 3-3 3h2v3h2v-3h2l-3-3Z" />
    </svg>
  );
}

function IconUnarchive() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M3 3h18v4H3V3Zm2 6h14v12H5V9Zm7 5 3-3h-2v-3h-2v3h-2l3 3Z" />
    </svg>
  );
}

export default function TaskCard({
  task,
  index = 0,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onUndo = () => {},
  selected = false,
  onSelect,
}: {
  task: TaskItem;
  index?: number;
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onUndo?: (item: TaskItem, index: number) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}) {
  const [idHover, setHover] = useState(-1);
  const [confirming, setConfirming] = useState(false);

  function enableHover(id: number) {
    setHover(id);
  }

  function disableHover() {
    setHover(-1);
  }

  if (confirming) {
    return (
      <DeleteConfirmationModal
        taskTitle={task.title}
        horizontal={task.archived}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          onDelete(task.id);
          setConfirming(false);

          toast.custom(
            (t) => (
              <div
              style={{
                background: "#333",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                borderRadius: "8px",
                gap: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
              }}>
                Deleted {task.title}
                <button
                  className="btn btn ghost"
                  onClick={() => {
                    onUndo(task, index);
                    toast.dismiss(t.id);
                  }}
                >Undo?</button>
              </div>
            ), 
            { duration: 10000 }
          )
        }}
      />
    );
  }
  return (
    <div
      className={`panel ${styles.card}`}
      style={{ animation: "fadeInUp 0.35s ease both" }}
    >
      <div className={styles.row}>
        <div className={styles.titleBox}>
          <h3 className={styles.title}>{task.title}</h3>
          <div className={styles.tags}>
            <span className={`${styles.tag} ${styles.subteam}`}>
              {task.subteam}
            </span>
            <span
              className={`${styles.tag} ${
                styles[
                  (task.priority?.toLowerCase() ?? "low") as
                    | "low"
                    | "medium"
                    | "high"
                ]
              }`}
            >
              {task.priority ?? "Low"}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          {onSelect && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              title="Select for batch operation"
              aria-label={`Select ${task.title} for batch operation`}
              className={checkboxStyles.checkbox}
            />
          )}
          {!task.archived && (
            <>
              <button
                className="btn ghost"
                title={task.completed ? "Mark uncompleted" : "Mark completed"}
                onClick={() => onToggle(task.id)}
                onMouseOver={() => enableHover(0)}
                onMouseOut={() => disableHover()}
              >
                <IconCheck />{" "}
                {idHover === 0
                  ? task.completed
                    ? "Uncomplete"
                    : "Complete"
                  : null}
              </button>
              {task.completed && (
                <button
                  className="btn ghost"
                  title="Archive Task"
                  onClick={() => onArchive(task.id, true)}
                  onMouseOver={() => enableHover(1)}
                  onMouseOut={() => disableHover()}
                >
                  <IconArchive /> {idHover === 1 ? "Archive" : null}
                </button>
              )}
            </>
          )}
          {task.archived && (
            <button
              className="btn ghost"
              title="Unarchive Task"
              onClick={() => onArchive(task.id, false)}
              onMouseOver={() => enableHover(2)}
              onMouseOut={() => disableHover()}
            >
              <IconUnarchive /> {idHover === 2 ? "Unarchive" : null}
            </button>
          )}
          <button
            className="btn ghost"
            title="Edit"
            onClick={() => onEdit(task)}
            onMouseOver={() => enableHover(3)}
            onMouseOut={() => disableHover()}
          >
            <IconEdit /> {idHover === 3 ? "Edit" : null}
          </button>
          <button
            className="btn ghost"
            title="Delete"
            onClick={() => setConfirming(true)}
            onMouseOver={() => enableHover(4)}
            onMouseOut={() => disableHover()}
          >
            <IconTrash /> {idHover === 4 ? "Delete" : null}
          </button>
        </div>
      </div>
      {task.description && <p className={styles.desc}>{task.description}</p>}
      <div className={styles.meta}>
        {task.assignee && (
          <span>
            Assignee: <strong>{task.assignee}</strong>
          </span>
        )}
        {task.dueDate && (
          <span>
            Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong>
          </span>
        )}
        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
