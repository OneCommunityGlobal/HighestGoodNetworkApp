import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faBook,
  faHeart,
  faClock,
  faChartBar,
  faCheckCircle,
  faUserGraduate,
} from '@fortawesome/free-solid-svg-icons';
import styles from './MetricCard.module.css';

const iconMap = {
  'fa-chart-line': faChartLine,
  'fa-book': faBook,
  'fa-heart': faHeart,
  'fa-clock': faClock,
  'fa-chart-bar': faChartBar,
  'fa-check-circle': faCheckCircle,
  'fa-user-graduate': faUserGraduate,
};

const MetricCard = ({
  title,
  value,
  unit = '',
  change,
  changeType = 'neutral',
  icon,
  color = 'primary',
  size = 'medium',
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

  const faIcon = iconMap[icon];

  return (
    <div
      className={`${styles.metricCard} ${styles[size]} ${styles[color]} ${
        darkMode ? styles.darkMode : ''
      }`}
    >
      {/* Header with icon and title */}
      <div className={styles.cardHeader}>
        {icon && faIcon && (
          <div className={styles.iconContainer}>
            <FontAwesomeIcon icon={faIcon} />
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
