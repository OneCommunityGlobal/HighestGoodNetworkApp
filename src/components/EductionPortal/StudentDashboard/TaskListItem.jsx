import React from 'react';
import styles from './TaskListItem.module.css';
import { useTaskLogic } from './useTaskLogic';

const TaskListItem = ({ task, onMarkAsDone }) => {
  const {
    progressPercentage,
    canMarkDone,
    statusBadge,
    markAsDoneTooltip,
    formattedTimeAndDate,
    progressText,
  } = useTaskLogic(task, styles);

  const handleMarkAsDone = () => {
    if (canMarkDone) {
      onMarkAsDone(task.id);
    }
  };

  return (
    <div className={styles.taskListItem}>
      {/* Task Info */}
      <div className={styles.taskInfo}>
        <div className={styles.taskHeader}>
          <h3 className={styles.taskTitle}>{task.course_name || task.title}</h3>
          {task.subtitle && <p className={styles.taskSubtitle}>{task.subtitle}</p>}
        </div>

        {/* Status Badge */}
        <div className={`${styles.statusBadge} ${statusBadge.className}`}>{statusBadge.text}</div>

        {/* Time and Date */}
        <div className={styles.timeInfo}>
          <span>{formattedTimeAndDate}</span>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span>{progressText}</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Icons */}
      <div className={styles.actionIcons}>
        <button className={styles.clockButton} title="Log Time">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </button>

        {task.is_completed ? (
          <button className={styles.completedButton} disabled>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </button>
        ) : (
          <button
            className={`${styles.markDoneButton} ${!canMarkDone ? styles.disabled : ''}`}
            onClick={handleMarkAsDone}
            disabled={!canMarkDone}
            title={markAsDoneTooltip}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskListItem;
