import React from 'react';
import styles from './TaskListView.module.css';
import TaskListItem from './TaskListItem';

const TaskListView = ({ tasks, onMarkAsDone }) => {
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
        <TaskListItem key={task._id || task.id} task={task} onMarkAsDone={onMarkAsDone} />
      ))}
    </div>
  );
};

export default TaskListView;
