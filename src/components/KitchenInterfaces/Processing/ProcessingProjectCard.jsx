import React from 'react';
import { useSelector } from 'react-redux';
import styles from './ProcessingLandingPage.module.css';

const ProcessingProjectCard = ({ project }) => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const getPriorityColor = priority => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return styles.priorityHigh;
      case 'medium':
        return styles.priorityMedium;
      case 'low':
        return styles.priorityLow;
      default:
        return styles.priorityLow;
    }
  };

  const formatDate = dateStr => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD format like in screenshot
  };

  return (
    <div className={`${styles.projectCard} ${darkMode ? styles.darkModeCard : ''}`}>
      <div className={styles.projectHeader}>
        <div>
          <h3 className={styles.projectName}>{project.item_name}</h3>
          <span className={styles.projectQuantity}>
            Quantity: {project.quantity} {project.unit || 'lbs'}
          </span>
        </div>
        <span className={`${styles.priorityBadge} ${getPriorityColor(project.priority)}`}>
          {project.priority || 'Low'} priority
        </span>
      </div>

      <div className={styles.projectFooter}>
        {project.batches > 0 && (
          <div className={styles.footerItem}>
            <span className={styles.footerLabel}>Batches</span>
            <span className={styles.footerValue}>{project.batches} batches</span>
          </div>
        )}

        <div className={styles.footerItem}>
          <span className={styles.footerLabel}>Scheduled Date</span>
          <span className={styles.footerValue}>{formatDate(project.scheduled_date)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingProjectCard;
