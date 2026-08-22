import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '~/utils/URL';
import styles from '../styles/HGNFormListPage.module.css';

const HGN_QUESTIONNAIRE_NAME = 'HGN Development Team Questionnaire';
const HGN_QUESTIONNAIRE_DESCRIPTION =
  'Your answers are used for team collaboration and placement based on your interests and strengths.';

function HGNFormListPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const loadForms = async () => {
      try {
        const response = await axios.get(ENDPOINTS.HGN_FORMS);
        setForms(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, []);

  return (
    <main className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <h1>HGN Forms</h1>
      <div className={styles.formList}>
        <Link to="/hgnform/page1" className={styles.formCard}>
          <h2>{HGN_QUESTIONNAIRE_NAME}</h2>
          <p>{HGN_QUESTIONNAIRE_DESCRIPTION}</p>
        </Link>

        {loading && <div className={styles.message}>Loading forms...</div>}
        {error && (
          <div className={styles.message}>
            Unable to load additional forms. Please try again later.
          </div>
        )}
        {!loading && !error && !forms.length && (
          <div className={styles.message}>No additional forms are currently available.</div>
        )}

        {forms.map(form => (
          <article key={form._id || form.formID} className={styles.formCard}>
            <h2>{form.formName}</h2>
            <p>{form.description || 'No description available.'}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default HGNFormListPage;
