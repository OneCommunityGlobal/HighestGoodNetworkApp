import styles from '../styles/QuestionnaireInfo.module.css';
import { useSelector } from 'react-redux';

function ThankYou() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const containerClass = `${styles.questionnaireInfo} ${darkMode ? styles.darkContainer : ''}`;
  const stripClass = `${styles.blueStrip} ${darkMode ? styles.darkStrip : ''}`;
  return (
    <div className={containerClass}>
      <div className={stripClass} />
      <h1 style={{ marginBottom: '40px' }}>HGN Development Team Questionnaire</h1>
      <p style={{ marginBottom: '30px', fontSize: '16px', fontWeight: 'bold' }}>
        Thank you for your response! Your answers have been successfully recorded.
      </p>
      <p style={{ marginBottom: '30px', fontSize: '14px' }}>
        You can now safely close this window. We appreciate your time!
      </p>
    </div>
  );
}

export default ThankYou;
