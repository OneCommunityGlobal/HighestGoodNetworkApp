import styles from '../styles/QuestionnaireInfo.module.css';
import { useSelector } from 'react-redux';
import { getBoxStyling, getFontColor } from '../../../styles';

function ThankYou() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div
      className={`${styles.questionnaireInfo} ${darkMode ? 'bg-space-cadet' : ''}`}
      style={getBoxStyling(darkMode)}
    >
      <div className={`${styles.blueStrip}`} />
      <h1 className={`${getFontColor(darkMode)}`} style={{ marginBottom: '40px' }}>
        HGN Development Team Questionnaire
      </h1>
      <p
        className={`${getFontColor(darkMode)}`}
        style={{ marginBottom: '30px', fontSize: '16px', fontWeight: 'bold' }}
      >
        Thank you for your response! Your answers have been successfully recorded.
      </p>
      <p className={`${getFontColor(darkMode)}`} style={{ marginBottom: '30px', fontSize: '14px' }}>
        You can now safely close this window. We appreciate your time!
      </p>
    </div>
  );
}

export default ThankYou;
