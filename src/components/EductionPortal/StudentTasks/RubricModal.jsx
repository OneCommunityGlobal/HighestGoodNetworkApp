// src/components/EductionPortal/StudentTasks/RubricModal.jsx
import React from 'react';
import styles from './StudentTasks.module.css';

export default function RubricModal({ task, onClose }) {
  const handleOverlayClick = e => {
    if (e.target.classList.contains(styles.modalOverlay)) onClose();
  };

  const handleOverlayKeyDown = e => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      onClose();
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      role="button"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
      tabIndex={0}
      aria-label="Close modal"
    >
      <div className={styles.modal}>
        <button
          className={styles.closeBtn}
          type="button"
          aria-label="Close rubric modal"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className={styles.rubricTitle}>{task.title}</h2>
        <h3 className={styles.rubricSubtitle}>Grading Rubric</h3>

        <ul className={styles.rubricList}>
          {task.rubric.map((criteria, idx) => (
            <li key={idx} className={styles.rubricItem}>
              {criteria}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
