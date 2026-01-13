import React from 'react';
import styles from './MetricCard.module.css';
import { useSelector } from 'react-redux';

function MetricCard({ metricname, metricvalue, color, children: icon }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={`${styles.metricCard} ${darkMode ? styles.darkModeCard : ''}`}>
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
