import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './StudentTasks.module.css';

export default function RubricModal({ task, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleOverlayClick = e => {
    if (e.target.classList.contains(styles.modalOverlay)) onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick} role="presentation">
      <div
        className={styles.modal}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rubric-modal-title"
        tabIndex={-1}
      >
        <button
          className={styles.closeBtn}
          type="button"
          aria-label="Close rubric modal"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 id="rubric-modal-title" className={styles.rubricTitle}>
          {task.title}
        </h2>
        <h3 className={styles.rubricSubtitle}>Grading Rubric</h3>

        <ul className={styles.rubricList}>
          {task.rubric.map(crit => (
            <li key={crit} className={styles.rubricItem}>
              {crit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

RubricModal.propTypes = {
  task: PropTypes.shape({
    title: PropTypes.string.isRequired,
    rubric: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
