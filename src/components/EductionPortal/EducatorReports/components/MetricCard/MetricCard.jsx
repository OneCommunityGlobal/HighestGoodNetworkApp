import React from 'react';
import { useSelector } from 'react-redux';
import styles from './MetricCard.module.css';

const MetricCard = ({
  title,
  value,
  unit = '',
  change,
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon,
  color = 'primary',
  size = 'medium', // 'small', 'medium', 'large'
  description,
  loading = false,
}) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return 'fa-arrow-up';
      case 'negative':
        return 'fa-arrow-down';
      default:
        return 'fa-minus';
    }
  };

  const getChangeText = () => {
    if (change === undefined || change === null) return null;

    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  if (loading) {
    return (
      <div
        className={`${styles.metricCard} ${styles[size]} ${darkMode ? styles.darkMode : ''} ${
          styles.loading
        }`}
      >
        <div className={styles.loadingShimmer}>
          <div className={styles.shimmerLine} />
          <div className={styles.shimmerLine} />
          <div className={styles.shimmerLine} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.metricCard} ${styles[size]} ${styles[color]} ${
        darkMode ? styles.darkMode : ''
      }`}
    >
      {/* Header with icon and title */}
      <div className={styles.cardHeader}>
        {icon && (
          <div className={styles.iconContainer}>
            <i className={`fa ${icon}`} aria-hidden="true" />
          </div>
        )}
        <h3 className={styles.title}>{title}</h3>
      </div>

      {/* Main value display */}
      <div className={styles.valueContainer}>
        <div className={styles.mainValue}>
          <span className={styles.value}>{value}</span>
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>

        {/* Change indicator */}
        {getChangeText() && (
          <div className={`${styles.changeIndicator} ${styles[changeType]}`}>
            <i className={`fa ${getChangeIcon()}`} aria-hidden="true" />
            <span className={styles.changeValue}>{getChangeText()}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className={styles.description}>
          <p>{description}</p>
        </div>
      )}

      {/* Visual accent */}
      <div className={styles.accent} />
    </div>
  );
};

export default MetricCard;
