'use client';
import styles from '@/styles/FilterBar.module.css';
import { Subteam } from '@/lib/types';

type StatusFilter = 'All' | 'Completed' | 'Uncompleted';

export default function FilterBar({
  statusFilter,
  subteamFilter,
  onStatusChange,
  onSubteamChange,
}: {
  statusFilter: StatusFilter;
  subteamFilter: Subteam | 'All';
  onStatusChange: (f: StatusFilter) => void;
  onSubteamChange: (s: Subteam | 'All') => void;
}) {
  const subteams: (Subteam | 'All')[] = ['All', 'Electrical', 'Finance', 'Firmware', 'Management', 'Marketing', 'Mechanical', 'Web Dev'];

  return (
    <div className={`${styles.bar} panel`}>
      <label className={styles.label}>
        <span>Status</span>
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value as StatusFilter)}
        >
          <option>All</option>
          <option>Completed</option>
          <option>Uncompleted</option>
        </select>
      </label>

      <label className={styles.label}>
        <span>Subteam</span>
        <select
          className={styles.select}
          value={subteamFilter}
          onChange={e => onSubteamChange(e.target.value as Subteam | 'All')}
        >
          {subteams.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
    </div>
  );
}