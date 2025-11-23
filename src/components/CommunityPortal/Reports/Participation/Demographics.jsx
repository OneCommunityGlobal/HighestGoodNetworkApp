import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function Demographics() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`${styles.demographicsPage} ${darkMode ? styles.demographicsPageDark : ''}`}>
      <h2
        className={`${styles.demographicsHeader} ${darkMode ? styles.demographicsHeaderDark : ''}`}
      >
        Demographics Overview
      </h2>

      <div className={styles.demographicsContent}>
        <div className={styles.placeholderBox}>
          <p>Charts and breakdowns for age, gender, and location demographics will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default Demographics;
