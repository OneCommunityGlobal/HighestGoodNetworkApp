import React from 'react';
import styles from './TaskListItem.module.css';

const TaskListItem = ({ task, onMarkAsDone }) => {
  // Calculate progress percentage
  const progressPercentage =
    task.suggested_total_hours > 0
      ? Math.round((task.logged_hours / task.suggested_total_hours) * 100)
      : 0;

  // Determine if task can be marked as done
  const canMarkAsDone = () => {
    if (task.is_completed) return false;

    // For read-only tasks: can be marked done only after requisite hours are logged
    if (task.task_type === 'read-only') {
      return task.logged_hours >= task.suggested_total_hours;
    }

    // For write tasks: can be marked done if upload is made OR hours requirement is met
    if (task.task_type === 'write') {
      return task.has_upload || task.logged_hours >= task.suggested_total_hours;
    }

    return false;
  };

  // Get status badge info
  const getStatusBadge = () => {
    if (task.is_completed) {
      return { text: 'Completed', className: styles.completedBadge };
    }

    if (task.has_upload && task.task_type === 'write') {
      return { text: 'Hours Met', className: styles.hoursMetBadge };
    }

    if (task.logged_hours >= task.suggested_total_hours) {
      return { text: 'Hours Met', className: styles.hoursMetBadge };
    }

    if (task.has_comments) {
      return { text: 'Comments', className: styles.commentsBadge };
    }

    return { text: 'Pending Review', className: styles.pendingBadge };
  };

  const statusBadge = getStatusBadge();
  const canMarkDone = canMarkAsDone();

  // Format time
  const formatTime = hours => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
          <span>
            {formatTime(task.logged_hours || 0)} •{' '}
            {formatDate(task.last_logged_date || task.created_at)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span>
              Progress: {task.logged_hours || 0}/{task.suggested_total_hours} hrs (
              {progressPercentage}%)
            </span>
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
            title={canMarkDone ? 'Mark as Done' : 'Complete required hours first'}
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
