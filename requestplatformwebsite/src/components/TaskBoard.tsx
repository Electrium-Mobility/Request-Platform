
'use client';
import React from 'react';
import styles from '@/styles/TaskBoard.module.css';
import { TaskItem, Subteam, Priority } from '@/lib/types';
import TaskCard from './TaskCard';

export default function TaskBoard({

  tasks,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onBatchUpdate,
}: {
  tasks: TaskItem[];
  onToggle: (id: string) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  onBatchUpdate: (ids: string[], update: { completed?: boolean; subteam?: Subteam; priority?: Priority }) => Promise<void>;
}) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const uncompleted = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed && !t.archived);
  const unassigned = uncompleted.filter(t => !t.assignee);
  const assigned = uncompleted.filter(t => t.assignee);

  function handleSelect(id: string, checked: boolean) {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  }

  async function handleBatchUpdate(update: { completed?: boolean; subteam?: Subteam; priority?: Priority }) {
    await onBatchUpdate(selectedIds, update);
    setSelectedIds([]);
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  // Helper to check if a task is selected
  function isSelected(id: string) {
    return selectedIds.includes(id);
  }

  // Batch bar at top if any selected
  const BatchOperationsBar = require('./BatchOperationsBar').default;

  return (
    <div>
      {selectedIds.length > 0 && (
        <BatchOperationsBar
          selectedCount={selectedIds.length}
          onBatchUpdate={handleBatchUpdate}
          onClearSelection={handleClearSelection}
        />
      )}
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
                onArchive={onArchive}
                selected={isSelected(t.id)}
                onSelect={handleSelect}
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
                onArchive={onArchive}
                selected={isSelected(t.id)}
                onSelect={handleSelect}
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
                onArchive={onArchive}
                selected={isSelected(t.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
