import { useState } from 'react';
import { useSelector } from 'react-redux';
import ReviewersRequirementChart from './ReviewersRequirementChart';
import styles from './AnalyticsDashboard.module.css';

const durationOptions = [
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'Last 2 weeks', value: 'last2weeks' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'All Time', value: 'allTime' },
];

const AnalyticsDashboard = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [duration, setDuration] = useState('lastWeek');

  return (
    <div className={`${styles.page} ${darkMode ? styles.pageDark : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Reviewers Ranked by Requirement Satisfied</h2>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="duration">
            Duration:
          </label>
          <select
            id="duration"
            className={styles.filterSelect}
            value={duration}
            onChange={e => setDuration(e.target.value)}
          >
            {durationOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className={styles.helperText}>
        Shows how many PR reviews each reviewer completed in the selected period, grouped by review
        quality. The list length comes from the backend for that duration (not a fixed frontend
        limit).
      </p>

      <div className={styles.chartCard}>
        <ReviewersRequirementChart duration={duration} darkMode={darkMode} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
