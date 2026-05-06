import React from 'react';
import PropTypes from 'prop-types';
import styles from './TaskCardView.module.css';
import TaskCard from './TaskCard';

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

TaskCardView.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onMarkAsDone: PropTypes.func,
  onLogTime: PropTypes.func,
  intermediateTasks: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({}))),
  expandedTasks: PropTypes.objectOf(PropTypes.bool),
  onToggleIntermediateTasks: PropTypes.func,
  onMarkIntermediateAsDone: PropTypes.func,
  darkMode: PropTypes.bool,
};

TaskCardView.defaultProps = {
  onMarkAsDone: undefined,
  onLogTime: undefined,
  intermediateTasks: {},
  expandedTasks: {},
  onToggleIntermediateTasks: undefined,
  onMarkIntermediateAsDone: undefined,
  darkMode: false,
};

export default TaskCardView;
