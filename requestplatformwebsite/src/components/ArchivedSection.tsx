'use client';
import { useState } from 'react';
import styles from '@/styles/TaskBoard.module.css';
import { TaskItem } from '@/lib/types';
import TaskCard from './TaskCard';

function IconChevronRight() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" className={styles.icon} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function ArchivedSection({
  tasks,
  onArchive,
  onDelete,
}: {
  tasks: TaskItem[];
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(true); // default folded
  const archived = tasks.filter(t => t.archived);

  return (
    <section
      style={{
        marginTop: '3rem',
        opacity: 0.85,
        fontSize: '0.95rem',
      }}
    >
      {/* Header */}
      <h3
        style={{
          fontWeight: 500,
          marginBottom: '1rem',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
        onClick={() => setCollapsed(c => !c)}
      >
      <span>
        {collapsed ? <IconChevronRight /> : <IconChevronDown />}
      </span>        
      Archived Tasks ({archived.length})
      </h3>

      {/* Collapsed? Hide content */}
      {!collapsed && (
        <>
          {archived.length === 0 && (
            <div className={styles.empty}>No archived tasks.</div>
          )}

          <div className={styles.archivedGrid}>
            {archived.map((t, i) => (
              <TaskCard
                key={t.id || `archived-${i}`}
                task={t}
                onToggle={() => {}}
                onEdit={() => {}}
                onDelete={onDelete}
                onArchive={onArchive}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
