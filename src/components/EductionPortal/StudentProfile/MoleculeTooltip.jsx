import React from 'react';
import PropTypes from 'prop-types';
import styles from './MoleculeTooltip.module.css';

/**
 * MoleculeTooltip Component
 * Displays detailed information about a molecule when hovered
 */
const MoleculeTooltip = ({ molecule, position }) => {
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
        return 'Not Started';
      default:
        return status;
    }
  };

  const getDifficultyColor = difficulty => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'medium':
        return '#FF9800';
      case 'hard':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <div
      className={styles.tooltip}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className={styles.tooltipHeader}>
        <h4 className={styles.moleculeName}>{molecule.name}</h4>
        <span className={styles.statusBadge} data-status={molecule.status}>
          {getStatusLabel(molecule.status)}
        </span>
      </div>

      {molecule.description && <p className={styles.description}>{molecule.description}</p>}

      <div className={styles.details}>
        {molecule.difficulty && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Difficulty:</span>
            <span
              className={styles.value}
              style={{ color: getDifficultyColor(molecule.difficulty) }}
            >
              {molecule.difficulty.charAt(0).toUpperCase() + molecule.difficulty.slice(1)}
            </span>
          </div>
        )}

        {molecule.moleculeType && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Type:</span>
            <span className={styles.value}>{molecule.moleculeType}</span>
          </div>
        )}

        {molecule.grade && molecule.grade !== 'pending' && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Grade:</span>
            <span className={styles.gradeBadge} data-grade={molecule.grade}>
              {molecule.grade}
            </span>
          </div>
        )}

        {molecule.timestamp && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Date:</span>
            <span className={styles.value}>{formatDate(molecule.timestamp)}</span>
          </div>
        )}

        {molecule.sourceTask && (
          <div className={styles.sourceTask}>
            <span className={styles.label}>Source Task:</span>
            <div className={styles.taskInfo}>
              {molecule.sourceTask.lessonPlan && (
                <div className={styles.taskDetail}>
                  <strong>Lesson:</strong> {molecule.sourceTask.lessonPlan}
                </div>
              )}
              {molecule.sourceTask.taskType && (
                <div className={styles.taskDetail}>
                  <strong>Type:</strong> {molecule.sourceTask.taskType}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MoleculeTooltip.propTypes = {
  molecule: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    status: PropTypes.string.isRequired,
    difficulty: PropTypes.string,
    moleculeType: PropTypes.string,
    grade: PropTypes.string,
    timestamp: PropTypes.string,
    sourceTask: PropTypes.shape({
      taskType: PropTypes.string,
      lessonPlan: PropTypes.string,
      assignedAt: PropTypes.string,
      completedAt: PropTypes.string,
    }),
  }).isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  }).isRequired,
};

export default MoleculeTooltip;
