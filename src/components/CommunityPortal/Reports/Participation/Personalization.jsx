import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './Participation.module.css';

function Personalization() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  return (
    <div
      className={`${styles.personalizationPage} ${darkMode ? styles.personalizationPageDark : ''}`}
    >
      <button
        type="button"
        className={`${styles.backBtn} ${darkMode ? styles.backBtnDark : ''}`}
        onClick={() => history.goBack()}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </button>

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
