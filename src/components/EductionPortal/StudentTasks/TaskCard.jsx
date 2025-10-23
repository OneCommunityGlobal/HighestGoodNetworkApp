// src/components/EductionPortal/StudentTasks/TaskCard.jsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './StudentTasks.module.css';
import RubricModal from './RubricModal';

const TaskCard = ({ task }) => {
  const history = useHistory();
  const [showRubric, setShowRubric] = useState(false);

  const handleCardClick = () => {
    // ✅ push with route state so the details page knows which task was clicked
    history.push(`/educationportal/student/tasks/${task.id}`, { task });
  };

  const handleRubricClick = e => {
    e.stopPropagation();
    setShowRubric(true);
  };

  const handleCloseRubric = () => setShowRubric(false);

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') handleCardClick();
  };

  return (
    <>
      <div
        className={styles.taskCard}
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.taskHeader}>
          <h3 className={styles.taskTitle}>{task.title}</h3>
          <div className={styles.dueDate}>
            <span className={styles.dueLabel}>Due:</span> <span>{task.dueDate}</span>
          </div>
        </div>

        <p className={styles.taskDescription}>{task.description}</p>

        <div className={styles.statusSection}>
          <span
            className={`${styles.statusTag} ${
              task.status === 'Incomplete'
                ? styles.incomplete
                : task.status === 'Submitted'
                ? styles.submitted
                : styles.graded
            }`}
          >
            {task.status}
          </span>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
            </div>
            <span className={styles.progressText}>{task.progress}%</span>
          </div>
        </div>

        <button className={styles.rubricButton} type="button" onClick={handleRubricClick}>
          View Grading Rubric
        </button>
      </div>

      {showRubric && <RubricModal task={task} onClose={handleCloseRubric} />}
    </>
  );
};

export default TaskCard;
