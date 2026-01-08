import React from 'react';
import styles from './MetricCard.module.css';

function MetricCard({ metricname, metricvalue }) {
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricCardHeader}>{metricname}</div>
      <div className={styles.metricCardBody}>
        <p>{metricvalue}</p>
      </div>
    </div>
  );
}

export default MetricCard;
