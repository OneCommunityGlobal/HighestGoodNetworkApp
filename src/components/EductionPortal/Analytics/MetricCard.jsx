import React from 'react';
import styles from './AnalyticsDashboard.module.css';

const MetricCard = ({ title, value, icon: Icon, subtitle }) => {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricHeader}>
        {Icon && <Icon className={styles.metricIcon} />}
        <div className={styles.metricTitle}>{title}</div>
      </div>
      <div className={styles.metricValue}>{value}</div>
      {subtitle && <div className={styles.metricSubtitle}>{subtitle}</div>}
    </div>
  );
};

export default MetricCard;
