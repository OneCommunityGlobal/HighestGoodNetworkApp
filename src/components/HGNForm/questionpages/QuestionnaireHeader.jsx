import { forwardRef } from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/QuestionnaireInfo.module.css';

const QuestionnaireHeader = forwardRef((props, ref) => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerClass = `${styles.questionnaireInfo} ${darkMode ? styles.darkContainer : ''}`;
  const stripClass = `${styles.blueStrip} ${darkMode ? styles.darkStrip : ''}`;
  return (
    <div className={containerClass} ref={ref}>
      <div className={stripClass} />
      <h1 style={{ marginBottom: 0 }}>HGN Development Team Questionnaire</h1>
      <hr />
      <p style={{ marginBottom: '10px' }}>BM&apos;S Account</p>
    </div>
  );
});

QuestionnaireHeader.displayName = 'QuestionnaireHeader';

export default QuestionnaireHeader;
