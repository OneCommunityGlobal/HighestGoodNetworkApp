import React from 'react';
import { canMarkIntermediateTaskAsDone, getMarkIntermediateAsDoneTooltip } from './taskUtils';

const IntermediateTasksList = ({ intermediateTasks, styles, onMarkIntermediateAsDone }) => {
  if (intermediateTasks.length === 0) {
    return <p className="noIntermediateTasks">No sub-tasks available</p>;
  }

  return intermediateTasks.map(subTask => {
    const subTaskProgress = subTask.status === 'completed' ? 100 : 0;
    const canMarkIntermediateDone = canMarkIntermediateTaskAsDone(subTask);
    const intermediateTooltip = getMarkIntermediateAsDoneTooltip(subTask);

    return (
      <div key={subTask._id || subTask.id} className="intermediateTaskItem">
        <div className="intermediateTaskContent">
          <h4 className="intermediateTaskTitle">{subTask.title}</h4>
          {subTask.description && (
            <p className="intermediateTaskDescription">{subTask.description}</p>
          )}
          {/* Progress Bar for Sub-task */}
          <div className="subTaskProgressSection">
            <div className="subTaskProgressBar">
              <div className="subTaskProgressFill" style={{ width: `${subTaskProgress}%` }} />
            </div>
            <span className="subTaskProgressText">{subTaskProgress}%</span>
          </div>
          <div className="intermediateTaskMeta">
            <span className="intermediateTaskHours">
              {subTask.logged_hours || 0} / {subTask.expected_hours || 0}h
            </span>
            {subTask.due_date && (
              <span className="intermediateTaskDueDate">
                Due: {new Date(subTask.due_date).toLocaleDateString()}
              </span>
            )}
            <span
              className={`${styles.intermediateTaskStatus} ${styles[`status${subTask.status}`]}`}
            >
              {subTask.status || 'pending'}
            </span>
          </div>
        </div>
        {subTask.status !== 'completed' && (
          <button
            className={`${styles.markIntermediateDoneButton} ${
              !canMarkIntermediateDone ? styles.disabled : ''
            }`}
            onClick={() => onMarkIntermediateAsDone(subTask._id || subTask.id)}
            disabled={!canMarkIntermediateDone}
            title={intermediateTooltip}
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
    );
  });
};

export default IntermediateTasksList;
