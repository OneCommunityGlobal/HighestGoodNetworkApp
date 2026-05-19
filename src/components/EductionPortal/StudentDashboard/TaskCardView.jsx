import React from 'react';
import PropTypes from 'prop-types';
import styles from './TaskCardView.module.css';
import TaskCard from './TaskCard';
import { taskViewPropTypes, taskViewDefaultProps } from './taskPropTypes';

const TaskCardView = ({
  tasks,
  onMarkAsDone,
  onLogTime,
  intermediateTasks,
  expandedTasks,
  onToggleIntermediateTasks,
  onMarkIntermediateAsDone,
  darkMode = false,
}) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tasks found. Start by logging some time!</p>
      </div>
    );
  }

  return (
    <div className={styles.cardView}>
      {tasks.map(task => (
        <TaskCard
          key={task._id || task.id}
          task={task}
          onMarkAsDone={onMarkAsDone}
          onLogTime={onLogTime}
          intermediateTasks={intermediateTasks[task.id] || []}
          isExpanded={expandedTasks[task.id] || false}
          onToggleIntermediateTasks={onToggleIntermediateTasks}
          onMarkIntermediateAsDone={onMarkIntermediateAsDone}
          darkMode={darkMode}
        />
      ))}
    </div>
  );
};

TaskCardView.propTypes = taskViewPropTypes;
TaskCardView.defaultProps = taskViewDefaultProps;

export default TaskCardView;
