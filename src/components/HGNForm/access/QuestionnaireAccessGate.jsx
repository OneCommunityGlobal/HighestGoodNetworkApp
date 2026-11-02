import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Spinner } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import styles from '../styles/QuestionnaireAccessGate.module.css';

const DENIED_MESSAGES = {
  INACTIVE: 'Your account is not active, so the questionnaire is not available to you.',
  ACCESS_REVOKED:
    'Your Highest Good Network Dropbox access has been revoked, so the questionnaire is no longer available to you.',
  NOT_HGN_TEAM_FOLDER:
    'This questionnaire is only available to people invited through the Highest Good Network Dropbox. Your Dropbox invite is for a different team folder.',
};
const DEFAULT_DENIED_MESSAGE =
  'This questionnaire becomes available after you have been set up and invited through the Highest Good Network Dropbox process.';

// Remember a successful check so moving between questionnaire pages does not refetch.
const eligibleUserIds = new Set();

export const resetQuestionnaireAccessCache = () => eligibleUserIds.clear();

function QuestionnaireAccessGate({ children }) {
  const userId = useSelector(state => state.auth.user?.userid);
  const darkMode = useSelector(state => state.theme.darkMode);
  const [status, setStatus] = useState(() =>
    eligibleUserIds.has(userId) ? { eligible: true } : null,
  );

  useEffect(() => {
    if (!userId || eligibleUserIds.has(userId)) return undefined;
    let cancelled = false;

    axios
      .get(ENDPOINTS.HGN_FORM_ACCESS)
      .then(({ data }) => {
        if (data?.eligible) eligibleUserIds.add(userId);
        if (!cancelled) setStatus({ eligible: !!data?.eligible, reason: data?.reason });
      })
      .catch(() => {
        if (!cancelled) setStatus({ eligible: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (status?.eligible) return children;

  return (
    <main className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      {!status ? (
        <Spinner color="primary" aria-label="Checking questionnaire access" />
      ) : (
        <section className={styles.card} role="alert">
          <h1>HGN Questionnaire</h1>
          <p>
            {status.error
              ? 'We could not check your access to the questionnaire. Please refresh the page or try again later.'
              : DENIED_MESSAGES[status.reason] || DEFAULT_DENIED_MESSAGE}
          </p>
          {!status.error && (
            <p>If you think this is a mistake, please contact your manager or an administrator.</p>
          )}
        </section>
      )}
    </main>
  );
}

export const withQuestionnaireAccess = Component => {
  function WithQuestionnaireAccess(props) {
    return (
      <QuestionnaireAccessGate>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...props} />
      </QuestionnaireAccessGate>
    );
  }
  WithQuestionnaireAccess.displayName = `withQuestionnaireAccess(${Component.displayName ||
    Component.name ||
    'Component'})`;
  return WithQuestionnaireAccess;
};

export default QuestionnaireAccessGate;
