"use client";
import { useState } from "react";
import styles from "@/styles/TaskCard.module.css";
import checkboxStyles from "@/styles/BatchSelectCheckbox.module.css";
import { TaskItem } from "@/lib/types";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

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

function IconClaim() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onClaim,
  currentUserName,
  selected = false,
  onSelect,
}: {
  task: TaskItem;
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onClaim?: (id: string) => void;
  currentUserName?: string;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Task can be claimed if it has no assignee and user is logged in
  const canClaim = !task.assignee && !task.archived && onClaim && currentUserName;

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    try {
      await onClaim(task.id);
    } finally {
      setClaiming(false);
    }
  };

  if (confirming) {
    return (
      <DeleteConfirmationModal
        taskTitle={task.title}
        horizontal={task.archived}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          onDelete(task.id);
          setConfirming(false);
        }}
      />
    );
  }
  return (
    <div
      className={`panel ${styles.card}`}
      style={{ animation: "fadeInUp 0.35s ease both" }}
    >
      {/* Top Section */}
      <div className={styles.topSection}>
        {/* Left Content: Checkbox, Title, Tags */}
        <div className={styles.leftContent}>
          <div className={styles.titleRow}>
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
            <h3 className={styles.title}>{task.title}</h3>
          </div>
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

        {/* Right Content: Meta Info */}
        <div className={styles.rightContent}>
          {task.assignee && (
            <span>
              Assignee: <strong>{task.assignee}</strong>
            </span>
          )}
          {task.dueDate && (
            <span>
              Due:{" "}
              <strong>{new Date(task.dueDate).toLocaleDateString()}</strong>
            </span>
          )}
          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Middle: Description */}
      {task.description && <p className={styles.desc}>{task.description}</p>}

      {/* Bottom: Action Buttons */}
      <div className={styles.actionButtons}>
        {/* Claim Button - only show for unassigned, non-archived tasks */}
        {canClaim && (
          <button
            className="btn ghost"
            title="Claim this task"
            aria-label="Claim Task"
            onClick={handleClaim}
            disabled={claiming}
            style={{ 
              color: claiming ? '#666' : '#00a651',
              cursor: claiming ? 'not-allowed' : 'pointer'
            }}
          >
            <IconClaim />
            <span className={styles.btnText}>
              {claiming ? "Claiming..." : "Claim"}
            </span>
          </button>
        )}
        
        {!task.archived && (
          <>
            <button
              className="btn ghost"
              title={task.completed ? "Mark uncompleted" : "Mark completed"}
              onClick={() => onToggle(task.id)}
            >
              <IconCheck />
              <span className={styles.btnText}>
                {task.completed ? "Uncomplete" : "Complete"}
              </span>
            </button>
            {task.completed && (
              <button
                className="btn ghost"
                title="Archive Task"
                aria-label="Archive Task"
                onClick={() => onArchive(task.id, true)}
              >
                <IconArchive />
                <span className={styles.btnText}>Archive</span>
              </button>
            )}
          </>
        )}
        {task.archived && (
          <button
            className="btn ghost"
            title="Unarchive Task"
            aria-label="Unarchive Task"
            onClick={() => onArchive(task.id, false)}
          >
            <IconUnarchive />
            <span className={styles.btnText}>Unarchive</span>
          </button>
        )}
        <button
          className="btn ghost"
          title="Edit"
          aria-label="Edit Task"
          onClick={() => onEdit(task)}
        >
          <IconEdit />
          <span className={styles.btnText}>Edit</span>
        </button>
        <button
          className="btn ghost"
          title="Delete"
          aria-label="Delete Task"
          onClick={() => setConfirming(true)}
        >
          <IconTrash />
          <span className={styles.btnText}>Delete</span>
        </button>
      </div>
    </div>
  );
}
