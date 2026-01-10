import React from 'react';
import styles from './MetricCard.module.css';

function MetricCard({ metricname, metricvalue, color, children: icon }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricCardHeader}>{metricname}</div>
      <div className={styles.metricCardBody}>
        <p>{metricvalue}</p>
        <div className={styles.metricCardIcon} style={{ color: color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default MetricCard;
