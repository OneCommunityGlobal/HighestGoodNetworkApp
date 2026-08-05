import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './Participation.module.css';

function Demographics() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const history = useHistory();

  return (
    <div className={`${styles.demographicsPage} ${darkMode ? styles.demographicsPageDark : ''}`}>
      <button
        type="button"
        className={`${styles.backBtn} ${darkMode ? styles.backBtnDark : ''}`}
        onClick={() => history.goBack()}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        Back
      </button>

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
