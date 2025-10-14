'use client';
import styles from '@/styles/TaskBoard.module.css';
import { TaskItem } from '@/lib/types';
import TaskCard from './TaskCard';

export default function TaskBoard({
  tasks,
  onToggle,
  onEdit,
  onDelete,
}: {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
}) {
  const uncompleted = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  const unassigned = uncompleted.filter(t => !t.assignee);
  const assigned = uncompleted.filter(t => t.assignee);

  return (
    <div className={styles.grid}>
      {/* Uncompleted Unassigned */}
      <div className={styles.column}>
        <h3>Uncompleted — Unassigned</h3>
        <div className={styles.colBody}>
          {unassigned.length === 0 && (
            <div className={styles.empty}>No unassigned tasks.</div>
          )}
          {unassigned.map((t, i) => (
            <TaskCard
              key={t.id || `unassigned-${i}`}
              task={t}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Uncompleted Assigned */}
      <div className={styles.column}>
        <h3>Uncompleted — Assigned</h3>
        <div className={styles.colBody}>
          {assigned.length === 0 && (
            <div className={styles.empty}>No assigned tasks.</div>
          )}
          {assigned.map((t, i) => (
            <TaskCard
              key={t.id || `assigned-${i}`}
              task={t}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>

      {/* Completed */}
      <div className={styles.column}>
        <h3>Completed Tasks</h3>
        <div className={styles.colBody}>
          {completed.length === 0 && (
            <div className={styles.empty}>Nothing completed yet.</div>
          )}
          {completed.map((t, i) => (
            <TaskCard
              key={t.id || `completed-${i}`}
              task={t}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
