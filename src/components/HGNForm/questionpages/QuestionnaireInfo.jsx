import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import httpService from '~/services/httpService';
import styles from '../styles/QuestionnaireInfo.module.css';

function QuestionnaireInfo() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerClass = `${styles.questionnaireInfo} ${darkMode ? styles.darkContainer : ''}`;
  const stripClass = `${styles.blueStrip} ${darkMode ? styles.darkStrip : ''}`;
  const history = useHistory();
  const user = useSelector(state => state?.userProfile?.profile);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkExisting() {
      try {
        const userId = user?._id;
        const email = user?.email;
        if (!userId && !email) return;
        const res = await httpService.get('/api/hgnformresponses', {
          params: userId ? { user_id: userId } : undefined,
        });
        const rows = Array.isArray(res?.data) ? res.data : [];
        const exists = rows.some(
          r =>
            (userId && (r?.user_id === userId || r?.userInfo?._id === userId)) ||
            (email && r?.userInfo?.email?.toLowerCase() === email?.toLowerCase()),
        );
        if (mounted && exists) {
          history.replace('/hgn/profile/skills');
          return;
        }
      } catch {
        // ignore; allow form if check fails
      } finally {
        mounted && setCheckingExisting(false);
      }
    }
    checkExisting();
    return () => {
      mounted = false;
    };
  }, [user, history]);

  if (checkingExisting) return null;

  return (
    <div className={containerClass}>
      <div className={stripClass} />
      <h1>HGN Development Team Questionnaire</h1>
      <p>
        Your answers to this questionnaire are used for team collaboration and placing you on a
        Development Team based on your interests and strengths.
      </p>
      <p>This questionnaire contains four parts:</p>
      <ol>
        <li>General questions</li>
        <li>Frontend questions</li>
        <li>Backend questions</li>
        <li>Follow-up questions</li>
      </ol>
      <p style={{ marginTop: 0 }}>Please answer with your best judgement, thank you!</p>
      <hr />
      <p className={`${styles.required}`} style={{ color: 'red', margin: '15px' }}>
        * Indicates required question
      </p>
    </div>
  );
}

export default QuestionnaireInfo;
