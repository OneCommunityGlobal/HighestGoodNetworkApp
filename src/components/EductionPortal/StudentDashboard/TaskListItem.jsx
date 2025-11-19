import React from 'react';
import styles from './TaskListItem.module.css';
import { useTaskLogic } from './useTaskLogic';

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

  const handleMarkAsDone = () => {
    if (canMarkDone) {
      onMarkAsDone(task.id);
    }
  };

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
          {intermediateTasks.length === 0 ? (
            <p className={styles.noIntermediateTasks}>No sub-tasks available</p>
          ) : (
            <div className={styles.intermediateTasksList}>
              {intermediateTasks.map(subTask => (
                <div key={subTask._id || subTask.id} className={styles.intermediateTaskItem}>
                  <div className={styles.intermediateTaskContent}>
                    <h4 className={styles.intermediateTaskTitle}>{subTask.title}</h4>
                    {subTask.description && (
                      <p className={styles.intermediateTaskDescription}>{subTask.description}</p>
                    )}
                    <div className={styles.intermediateTaskMeta}>
                      <span className={styles.intermediateTaskHours}>
                        {subTask.expected_hours || 0}h
                      </span>
                      {subTask.due_date && (
                        <span className={styles.intermediateTaskDueDate}>
                          Due: {new Date(subTask.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span
                        className={`${styles.intermediateTaskStatus} ${
                          styles[`status${subTask.status}`]
                        }`}
                      >
                        {subTask.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  {subTask.status !== 'completed' && (
                    <button
                      className={styles.markIntermediateDoneButton}
                      onClick={() => handleMarkIntermediateAsDone(subTask._id || subTask.id)}
                      title="Mark as Done"
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
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskListItem;
