import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './StudentTasks.module.css';
import RubricModal from './RubricModal';

const getStatusClass = (status, css) => {
  if (status === 'Incomplete') return css.incomplete;
  if (status === 'Submitted') return css.submitted;
  return css.graded;
};

const TaskCard = ({ task, onOpenRubric }) => {
  const history = useHistory();
  const [showRubric, setShowRubric] = useState(false);

  const goToDetails = () => {
    history.push(`/educationportal/student/tasks/${task.id}`, { task });
  };

  const handleRubricClick = e => {
    e.stopPropagation();
    setShowRubric(true);
    onOpenRubric?.();
  };

  const statusClass = getStatusClass(task.status, styles);

  return (
    <>
      {/* Outer visual card wrapper */}
      <div className={styles.taskCard}>
        {/* Use a real button for the clickable body to satisfy a11y */}
        <button
          type="button"
          className={styles.cardMainButton}
          onClick={goToDetails}
          aria-label={`Open details for ${task.title}`}
        >
          <div className={styles.taskHeader}>
            <h3 className={styles.taskTitle}>{task.title}</h3>
            <div className={styles.dueDate}>
              <span className={styles.dueLabel}>Due:</span> <span>{task.dueDate}</span>
            </div>
          </div>

          <p className={styles.taskDescription}>{task.description}</p>

          <div className={styles.statusSection}>
            <span className={`${styles.statusTag} ${statusClass}`}>{task.status}</span>
            <div className={styles.progressContainer}>
              <div className={styles.progressBar} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: `${task.progress}%` }} />
              </div>
              <span className={styles.progressText} aria-label="Progress percentage">
                {task.progress}%
              </span>
            </div>
          </div>
        </button>

        <button className={styles.rubricButton} type="button" onClick={handleRubricClick}>
          View Grading Rubric
        </button>
      </div>

      {showRubric && <RubricModal task={task} onClose={() => setShowRubric(false)} />}
    </>
  );
};

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    subject: PropTypes.string,
    colorLevel: PropTypes.string,
    activityGroup: PropTypes.string,
    strategy: PropTypes.string,
    description: PropTypes.string.isRequired,
    status: PropTypes.oneOf(['Incomplete', 'Submitted', 'Graded']).isRequired,
    progress: PropTypes.number.isRequired,
    dueDate: PropTypes.string.isRequired,
    rubric: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onOpenRubric: PropTypes.func,
};

TaskCard.defaultProps = {
  onOpenRubric: undefined,
};

export default TaskCard;
