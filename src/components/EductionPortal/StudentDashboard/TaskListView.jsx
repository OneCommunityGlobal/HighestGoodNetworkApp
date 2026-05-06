import React from 'react';
import PropTypes from 'prop-types';
import styles from './TaskListView.module.css';
import TaskListItem from './TaskListItem';

const TaskListView = ({
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
    <div className={styles.listView}>
      {tasks.map(task => (
        <TaskListItem
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

TaskListView.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onMarkAsDone: PropTypes.func,
  onLogTime: PropTypes.func,
  intermediateTasks: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.shape({}))),
  expandedTasks: PropTypes.objectOf(PropTypes.bool),
  onToggleIntermediateTasks: PropTypes.func,
  onMarkIntermediateAsDone: PropTypes.func,
  darkMode: PropTypes.bool,
};

TaskListView.defaultProps = {
  onMarkAsDone: undefined,
  onLogTime: undefined,
  intermediateTasks: {},
  expandedTasks: {},
  onToggleIntermediateTasks: undefined,
  onMarkIntermediateAsDone: undefined,
  darkMode: false,
};

export default TaskListView;
