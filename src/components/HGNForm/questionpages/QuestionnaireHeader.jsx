import { forwardRef } from 'react';
import { useSelector } from 'react-redux';
import styles from '../styles/QuestionnaireInfo.module.css';
import { useSelector } from 'react-redux';
import { getBoxStyling, getFontColor } from '../../../styles';

const QuestionnaireHeader = forwardRef((props, ref) => {
  const darkMode = useSelector(state => state.theme.darkMode);
<<<<<<< HEAD
  const containerClass = `${styles.questionnaireInfo} ${darkMode ? styles.darkContainer : ''}`;
  const stripClass = `${styles.blueStrip} ${darkMode ? styles.darkStrip : ''}`;
  return (
    <div className={containerClass} ref={ref}>
      <div className={stripClass} />
      <h1 style={{ marginBottom: 0 }}>HGN Development Team Questionnaire</h1>
=======
  return (
    <div className={`${styles.questionnaireInfo} ${darkMode ? 'bg-space-cadet' : ''}`} ref={ref}>
      <div className={`${styles.blueStrip}`} />
      <h1 style={{ marginBottom: 0 }} className={`${getFontColor(darkMode)}`}>
        HGN Development Team Questionnaire
      </h1>
>>>>>>> d9c2c36e0 (add dark mode styling to page2)
      <hr />
      <p style={{ marginBottom: '10px' }} className={`${getFontColor(darkMode)}`}>
        BM&apos;S Account
      </p>
    </div>
  );
});

QuestionnaireHeader.displayName = 'QuestionnaireHeader';

export default QuestionnaireHeader;
