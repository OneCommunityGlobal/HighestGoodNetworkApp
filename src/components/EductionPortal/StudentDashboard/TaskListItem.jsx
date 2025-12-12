import React from 'react';
import styles from './TaskListItem.module.css';
import { useTaskLogic } from './useTaskLogic';
import MarkAsDoneButton from './MarkAsDoneButton';
import IntermediateTasksList from './IntermediateTasksList';

const TaskListItem = ({
  task,
  onMarkAsDone,
  intermediateTasks = [],
  isExpanded = false,
  onToggleIntermediateTasks,
  onMarkIntermediateAsDone,
}) => {
  const {
    progressPercentage,
    canMarkDone,
    statusBadge,
    markAsDoneTooltip,
    formattedTimeAndDate,
    progressText,
  } = useTaskLogic(task, styles, intermediateTasks);

  const handleToggleIntermediateTasks = () => {
    if (onToggleIntermediateTasks) {
      onToggleIntermediateTasks(task.id);
    }
  };

  const handleMarkIntermediateAsDone = intermediateTaskId => {
    if (onMarkIntermediateAsDone) {
      onMarkIntermediateAsDone(intermediateTaskId, task.id);
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

        <MarkAsDoneButton
          task={task}
          intermediateTasks={intermediateTasks}
          canMarkDone={canMarkDone}
          markAsDoneTooltip={markAsDoneTooltip}
          onMarkAsDone={onMarkAsDone}
          styles={styles}
          iconSize="20"
        />

        {/* Toggle Intermediate Tasks */}
        {onToggleIntermediateTasks && (
          <button
            className={styles.toggleIntermediateButton}
            onClick={handleToggleIntermediateTasks}
            title={isExpanded ? 'Hide Sub-tasks' : 'Show Sub-tasks'}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isExpanded ? styles.expandedIcon : ''}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>

      {/* Intermediate Tasks */}
      {isExpanded && onToggleIntermediateTasks && (
        <div className={styles.intermediateTasksWrapper}>
          <div className={styles.intermediateTasksList}>
            <IntermediateTasksList
              intermediateTasks={intermediateTasks}
              styles={styles}
              onMarkIntermediateAsDone={handleMarkIntermediateAsDone}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskListItem;
