'use client';
import styles from '@/styles/FilterBar.module.css';
import { Subteam } from '@/lib/types';

type StatusFilter = 'All' | 'Completed' | 'Uncompleted';

type Props = {
  statusFilter: StatusFilter;
  subteamFilter: Subteam | 'All';
  searchQuery: string;
  onStatusChange: (f: StatusFilter) => void;
  onSubteamChange: (s: Subteam | 'All') => void;
  onSearchChange: (q: string) => void;
};

export default function FilterBar({
  statusFilter,
  subteamFilter,
  searchQuery,
  onStatusChange,
  onSubteamChange,
  onSearchChange,
}: Props) {
  const statuses: StatusFilter[] = ['All', 'Completed', 'Uncompleted'];
  const subteams: (Subteam | 'All')[] = ['All','Electrical','Finance','Firmware','Management','Marketing','Mechanical','Web Dev'];

  return (
    <div className={styles.bar}>
      <label className={styles.label}>
        <span>Status</span>
        <select
          className={styles.select}
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value as StatusFilter)}
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
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

      {/* Search on the right */}
      <label className={styles.label} style={{ marginLeft: 'auto' }}>
        <span>Search</span>
        <input
          className={styles.input}
          type="text"
          placeholder="Search tasks"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </label>
    </div>
  );
}
