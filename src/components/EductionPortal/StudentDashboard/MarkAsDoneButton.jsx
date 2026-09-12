import React from 'react';

const MarkAsDoneButton = ({
  task,
  intermediateTasks,
  canMarkDone,
  markAsDoneTooltip,
  onMarkAsDone,
  styles,
  iconSize = '16',
}) => {
  const handleMarkAsDone = () => {
    if (canMarkDone) {
      onMarkAsDone(task.id);
    }
  };

  // Show completed only if task is completed AND (no subtasks OR all subtasks are completed)
  if (
    task.is_completed &&
    (intermediateTasks.length === 0 || intermediateTasks.every(t => t.status === 'completed'))
  ) {
    return (
      <button className={styles.completedButton} disabled>
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
        {iconSize === '16' && 'Completed'}
      </button>
    );
  }

  return (
    <button
      className={`${styles.markDoneButton} ${!canMarkDone ? styles.disabled : ''}`}
      onClick={handleMarkAsDone}
      disabled={!canMarkDone}
      title={markAsDoneTooltip}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20,6 9,17 4,12" />
      </svg>
      {iconSize === '16' && 'Mark as Done'}
    </button>
  );
};

export default MarkAsDoneButton;
