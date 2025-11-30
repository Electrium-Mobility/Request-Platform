"use client";
import React from 'react';
import stylesCard from '@/styles/TaskCard.module.css';

export default function DeleteConfirmationModal({
  taskTitle,
  onCancel,
  onConfirm,
  horizontal = false,
}: {
  taskTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  horizontal?: boolean;
}) {
  return (
    <div
      className={`panel ${stylesCard.card}`}
      style={{ animation: 'fadeInUp 0.2s ease both', padding: 12 }}
    >
      <div style={{ display: 'flex', flexDirection: horizontal ? 'row' : 'column', gap: '12px', alignItems: horizontal ? 'center' : 'stretch' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Delete Task</h3>
          <p style={{ marginTop: 8, color: 'var(--text-2)' }}>
            Are you sure you want to delete <strong>{taskTitle}</strong>? This action cannot be undone.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignSelf: horizontal ? 'auto' : 'flex-end' }}>
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button
            className="btn"
            onClick={onConfirm}
            style={{ background: 'var(--danger)', borderColor: 'var(--danger)', color: '#0b0b0b' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
