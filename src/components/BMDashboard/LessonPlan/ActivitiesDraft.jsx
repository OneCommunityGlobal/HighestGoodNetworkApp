'use client';

import React, { useState } from 'react';
import styles from './activitiesDraft.module.css';

const ActivitiesDraft = () => {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [strategy, setStrategy] = useState('');

  const strategies = [
    'Visual Learning',
    'Hands-on Practice',
    'Peer Collaboration',
    'Project-based Learning',
    'Discussion Groups',
    'Interactive Simulations',
    'Real-world Applications',
    'Gamification',
  ];

  return (
    <>
      <div className={styles.headerContainer}>
        <div>
          <h1 className={styles.title}>Draft Custom Activities</h1>
          <p className={styles.subtitle}>
            Create engaging activities based on your selected learning atoms.
          </p>
        </div>

        <button onClick={() => setOpen(true)} className={styles.addBtn}>
          + Add Activity
        </button>
      </div>

      {open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <button onClick={() => setOpen(false)} className={styles.closeBtn}>
              ×
            </button>

            <h2 className={styles.modalTitle}>Activity 1</h2>

            {/* Description */}
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={styles.textarea}
            />

            {/* Why I Chose This */}
            <label htmlFor="reason" className={styles.label}>
              Why I Chose This
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className={styles.textarea}
            />

            {/* Teaching Strategies */}
            <label htmlFor="strategy" className={styles.label}>
              Teaching Strategies
            </label>
            <select
              id="strategy"
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className={styles.select}
            >
              <option value="">Select teaching strategies...</option>
              {strategies.map((str, i) => (
                <option key={i} value={str}>
                  {str}
                </option>
              ))}
            </select>

            <button onClick={() => setOpen(false)} className={styles.saveBtn}>
              Save Activity
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivitiesDraft;
