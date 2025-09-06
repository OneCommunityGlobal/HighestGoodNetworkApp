import { useSelector } from 'react-redux';
import styles from '../styles/QuestionnaireInfo.module.css';
import { useSelector } from 'react-redux';
import { getBoxStyling, getFontColor } from '../../../styles';

function QuestionnaireInfo() {
  const darkMode = useSelector(state => state.theme.darkMode);
<<<<<<< HEAD
  const containerClass = `${styles.questionnaireInfo} ${darkMode ? styles.darkContainer : ''}`;
  const stripClass = `${styles.blueStrip} ${darkMode ? styles.darkStrip : ''}`;

  return (
    <div className={containerClass}>
      <div className={stripClass} />
      <h1>HGN Development Team Questionnaire</h1>
      <p>
=======
  return (
    <div
      className={`${styles.questionnaireInfo} ${darkMode ? 'bg-space-cadet' : ''}`}
      style={getBoxStyling(darkMode)}
    >
      <div className={`${styles.blueStrip}`} />
      <h1 className={`${getFontColor(darkMode)}`}>HGN Development Team Questionnaire</h1>
      <p className={`${getFontColor(darkMode)}`}>
>>>>>>> a2dce1bdb (add dark mode for questionnaire)
        Your answers to this questionnaire are used for team collaboration and placing you on a
        Development Team based on your interests and strengths.
      </p>
      <p className={`${getFontColor(darkMode)}`}>This questionnaire contains four parts:</p>
      <ol className={`${getFontColor(darkMode)}`}>
        <li>General questions</li>
        <li>Frontend questions</li>
        <li>Backend questions</li>
        <li>Follow-up questions</li>
      </ol>
      <p className={`${getFontColor(darkMode)}`} style={{ marginTop: 0 }}>
        Please answer with your best judgement, thank you!
      </p>
      <hr />
      <p className={styles.required} style={{ color: 'red', margin: '15px' }}>
        * Indicates required question
      </p>
    </div>
  );
}

export default QuestionnaireInfo;
