import React from 'react';
import styles from './WeeklyProgress.module.css';

const ProjectStatusBar = () => {
  return (
    <div className={styles.statusBar}>
      <span className={styles.statusTitle}>Weekly Progress (Phase 2)</span>
      <span className={styles.statusBadge}>Backend ✅</span>
      <span className={styles.statusBadgePrimary}>Frontend in progress</span>
    </div>
  );
};

export default ProjectStatusBar;
