'use client';
import styles from '@/styles/Modal.module.css';
import { useEffect, useState } from 'react';
import { TaskItem, Priority, Subteam } from '@/lib/types';

/*Double check all subteams are here later*/
const subteams: Subteam[] = ['Electrical', 'Finance', 'Firmware', 'Management', 'Marketing', 'Mechanical', 'Web Dev'];
const priorities: Priority[] = ['Low', 'Medium', 'High'];

export default function AddTaskModal({
  open,
  onClose,
  onSubmit,
  editing
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<TaskItem, 'id'|'createdAt'|'completed'> & { id?: string }) => void;
  editing?: TaskItem | null;
}) {
  const [taskData, setTaskData] = useState<Omit<TaskItem, 'id'|'createdAt'|'completed'> & { id?: string }>({
    id: undefined,
    title: '',
    description: '',
    subteam: 'Electrical',
    priority: 'Low',
    dueDate: '',
    assignee: '',
  });

  useEffect(() => {
    if (open && editing) {
      setTaskData({
        id: editing.id,
        title: editing.title,
        description: editing.description || '',
        subteam: editing.subteam,
        priority: editing.priority,
        dueDate: editing.dueDate || '',
        assignee: editing.assignee || '',
      });
    } else if (open && !editing) {
      setTaskData({
        id: undefined,
        title: '',
        description: '',
        subteam: 'Electrical',
        priority: 'Low',
        dueDate: '',
        assignee: '',
      });
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.title.trim()) return;

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
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideDown 0.25s ease both' }}
      >
        <h2>{editing ? 'Edit Task' : 'Add Task'}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label>
            <span>Task Title</span>
            <input
              value={taskData.title}
              onChange={e => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="Task Name..."
              required
            />
          </label>
          <label>
            <span>Description</span>
            <textarea
              value={taskData.description}
              onChange={e => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Optional details..."
            />
          </label>
          <div className={styles.row}>
            <label>
              <span>Subteam</span>
              <select
                value={taskData.subteam}
                onChange={e => setTaskData({ ...taskData, subteam: e.target.value as Subteam })}
              >
                {subteams.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>
              <span>Priority</span>
              <select
                value={taskData.priority}
                onChange={e => setTaskData({ ...taskData, priority: e.target.value as Priority })}
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>
          <div className={styles.row}>
            <label>
              <span>Due Date</span>
              <input
                type="date"
                value={taskData.dueDate}
                onChange={e => setTaskData({ ...taskData, dueDate: e.target.value })}
              />
            </label>
            <label>
              <span>Assign To</span>
              <input
                value={taskData.assignee}
                onChange={e => setTaskData({ ...taskData, assignee: e.target.value })}
                placeholder="Optional"
              />
            </label>
          </div>
          <div className={styles.actions}>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">
              {editing ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
