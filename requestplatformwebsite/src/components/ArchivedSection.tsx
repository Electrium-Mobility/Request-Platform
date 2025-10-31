'use client';
import styles from '@/styles/TaskBoard.module.css';
import { TaskItem } from '@/lib/types';
import TaskCard from './TaskCard';

export default function ArchivedSection({
  tasks,
  onArchive,
  onDelete,
}: {
  tasks: TaskItem[];
  onArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const archived = tasks.filter(t => t.archived);

  return (
    <section
      style={{
        marginTop: '3rem',
        opacity: 0.85,
        fontSize: '0.95rem',
      }}
    >
      <h3 style={{ fontWeight: 500, marginBottom: '1rem' }}>Archived Tasks</h3>
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
    </section>
  );
}
