import JobAnalytics from './jobAnalytics';
import { useSelector } from 'react-redux';
import styles from './jobAnalytics.module.css';

function ApplicationAnalyticsContainer() {
  const darkMode = useSelector(state => state.theme.darkMode);
  return (
    <div className={`${darkMode ? styles.jobAnalyticsDarkMode : ''}`}>
      <div className={`${styles.jobAnalytics}`}>
        <JobAnalytics />
      </div>
    </div>
  );
}

export default ApplicationAnalyticsContainer;
