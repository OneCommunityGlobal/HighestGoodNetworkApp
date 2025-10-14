import React from 'react';
import styles from './TaskCard.module.css';

const TaskCard = ({ task, onMarkAsDone }) => {
  // Calculate progress percentage
  const progressPercentage =
    task.suggested_total_hours > 0
      ? Math.round((task.logged_hours / task.suggested_total_hours) * 100)
      : 0;

  // Determine if task can be marked as done
  const canMarkAsDone = () => {
    if (task.is_completed) return false;

    // Only read tasks can be marked as complete manually
    // Must have logged hours >= suggested hours
    if (task.task_type === 'read') {
      return task.logged_hours >= task.suggested_total_hours;
    }

    // For other task types, cannot be marked done manually
    return false;
  };

  // Get status badge info
  const getStatusBadge = () => {
    if (task.status === 'completed' || task.status === 'graded') {
      return { text: 'Completed', className: styles.completedBadge };
    }

    if (task.has_upload && task.task_type === 'write') {
      return { text: 'Hours Met', className: styles.hoursMetBadge };
    }

    if (task.logged_hours >= task.suggested_total_hours) {
      return { text: 'Hours Met', className: styles.hoursMetBadge };
    }

    if (task.has_comments || (task.feedback && task.feedback.length > 0)) {
      return { text: 'Comments', className: styles.commentsBadge };
    }

    if (task.status === 'assigned') {
      return { text: 'Assigned', className: styles.pendingBadge };
    }

    return { text: 'Pending Review', className: styles.pendingBadge };
  };

  const statusBadge = getStatusBadge();
  const canMarkDone = canMarkAsDone();

  // Get tooltip text for mark as done button
  const getMarkAsDoneTooltip = () => {
    if (task.is_completed) {
      return 'Task is already completed';
    }

    if (task.task_type !== 'read') {
      return `Cannot mark as done: Only read tasks can be completed manually (Current type: ${task.task_type})`;
    }

    if (task.logged_hours < task.suggested_total_hours) {
      return `Cannot mark as done: Insufficient hours logged (${task.logged_hours || 0}/${
        task.suggested_total_hours
      } hrs required)`;
    }

    return 'Mark as Done - All requirements met';
  };

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
    <div className={styles.taskCard}>
      {/* Status Badge */}
      <div className={`${styles.statusBadge} ${statusBadge.className}`}>{statusBadge.text}</div>

      {/* Task Content */}
      <div className={styles.cardContent}>
        <div className={styles.taskHeader}>
          <h3 className={styles.taskTitle}>{task.course_name || task.title}</h3>
          {task.subtitle && <p className={styles.taskSubtitle}>{task.subtitle}</p>}
        </div>

        {/* Time and Date */}
        <div className={styles.timeInfo}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <span>
            {formatTime(task.logged_hours || 0)} •{' '}
            {formatDate(task.last_logged_date || task.created_at)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressInfo}>
            <span>
              Progress: {task.logged_hours || 0} / {task.suggested_total_hours} hrs (
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

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <button className={styles.clockButton} title="Log Time">
            <svg
              width="16"
              height="16"
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
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Completed
            </button>
          ) : (
            <button
              className={`${styles.markDoneButton} ${!canMarkDone ? styles.disabled : ''}`}
              onClick={handleMarkAsDone}
              disabled={!canMarkDone}
              title={getMarkAsDoneTooltip()}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
              Mark as Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
