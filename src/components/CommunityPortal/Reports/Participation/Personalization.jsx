import { useSelector } from 'react-redux';
import styles from './Participation.module.css';

function Personalization() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`${styles.personalizationPage} ${darkMode ? styles.personalizationPageDark : ''}`}
    >
      <h2
        className={`${styles.personalizationHeader} ${
          darkMode ? styles.personalizationHeaderDark : ''
        }`}
      >
        Personalization Insights
      </h2>

      <div className={styles.personalizationContent}>
        <div className={styles.placeholderBox}>
          <p>
            This section will show user engagement patterns, recommended event categories, and
            personalized insights based on participation history.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Personalization;
