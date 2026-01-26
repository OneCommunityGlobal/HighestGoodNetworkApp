import React from 'react';
import styles from './TaskCardView.module.css';
import TaskCard from './TaskCard';

const TaskCardView = ({
  tasks,
  onMarkAsDone,
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

export default TaskCardView;
