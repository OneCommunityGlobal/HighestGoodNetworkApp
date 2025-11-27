import React from 'react';
import styles from './TaskCard.module.css';
import { useTaskLogic } from './useTaskLogic';
import MarkAsDoneButton from './MarkAsDoneButton';
import IntermediateTasksList from './IntermediateTasksList';

const TaskCard = ({
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

          <MarkAsDoneButton
            task={task}
            intermediateTasks={intermediateTasks}
            canMarkDone={canMarkDone}
            markAsDoneTooltip={markAsDoneTooltip}
            onMarkAsDone={onMarkAsDone}
            styles={styles}
            iconSize="16"
          />
        </div>

        {/* Intermediate Tasks Section */}
        {onToggleIntermediateTasks && (
          <div className={styles.intermediateTasksSection}>
            <button
              className={styles.toggleIntermediateButton}
              onClick={handleToggleIntermediateTasks}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={isExpanded ? styles.expandedIcon : ''}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span>
                {isExpanded ? 'Hide' : 'Show'} Sub-tasks
                {intermediateTasks.length > 0 && ` (${intermediateTasks.length})`}
              </span>
            </button>

            {isExpanded && (
              <div className={styles.intermediateTasksList}>
                <IntermediateTasksList
                  intermediateTasks={intermediateTasks}
                  styles={styles}
                  onMarkIntermediateAsDone={handleMarkIntermediateAsDone}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
