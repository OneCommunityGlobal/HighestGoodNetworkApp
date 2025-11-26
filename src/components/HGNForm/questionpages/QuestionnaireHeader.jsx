import { forwardRef } from 'react';
import styles from '../styles/QuestionnaireInfo.module.css';

const QuestionnaireHeader = forwardRef((props, ref) => {
  return (
    <div className={`${styles.questionnaireInfo}`} ref={ref}>
      <div className={`${styles.blueStrip}`} />
      <h1 style={{ marginBottom: 0 }}>HGN Development Team Questionnaire</h1>
      <hr />
      <p style={{ marginBottom: '10px' }}>BM&apos;S Account</p>
    </div>
  );
});

QuestionnaireHeader.displayName = 'QuestionnaireHeader';

export default QuestionnaireHeader;
