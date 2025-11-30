import React, { useState } from 'react';
import { Subteam, Priority } from '@/lib/types';
import styles from '@/styles/BatchOperationsBar.module.css';

interface BatchOperationsBarProps {
  selectedCount: number;
  onBatchUpdate: (update: {
    completed?: boolean;
    subteam?: Subteam;
    priority?: Priority;
  }) => void;
  onClearSelection: () => void;
}

export default function BatchOperationsBar({ selectedCount, onBatchUpdate, onClearSelection }: BatchOperationsBarProps) {
  const [completed, setCompleted] = useState<string>('');
  const [subteam, setSubteam] = useState<Subteam | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');

  function handleApply() {
    onBatchUpdate({
      completed: completed === '' ? undefined : completed === 'completed',
      subteam: subteam || undefined,
      priority: priority || undefined,
    });
    setCompleted('');
    setSubteam('');
    setPriority('');
  }

  return (
    <div className={styles.bar}>
      <span className={styles.count}>{selectedCount} selected</span>
      <select className={styles.select} value={completed} onChange={e => setCompleted(e.target.value)}>
        <option value="">Change Status</option>
        <option value="completed">Completed</option>
        <option value="uncompleted">Uncompleted</option>
      </select>
      <select className={styles.select} value={subteam} onChange={e => setSubteam(e.target.value as Subteam | '')}>
        <option value="">Change Subteam</option>
        <option value="Electrical">Electrical</option>
        <option value="Finance">Finance</option>
        <option value="Firmware">Firmware</option>
        <option value="Management">Management</option>
        <option value="Marketing">Marketing</option>
        <option value="Mechanical">Mechanical</option>
        <option value="Web Dev">Web Dev</option>
      </select>
      <select className={styles.select} value={priority} onChange={e => setPriority(e.target.value as Priority | '')}>
        <option value="">Change Priority</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button
        className={styles.btn}
        onClick={handleApply}
        disabled={selectedCount === 0 || (completed === '' && subteam === '' && priority === '')}
      >
        Apply
      </button>
      <button className={`${styles.btn} ${styles.ghost}`} onClick={onClearSelection}>Clear</button>
    </div>
  );
}
