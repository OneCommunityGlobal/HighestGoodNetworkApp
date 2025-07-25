import styles from '../styles/QuestionnaireInfo.module.css';

function ThankYou() {
  return (
    <div className={`${styles.questionnaireInfo}`}>
      <div className={`${styles.blueStrip}`} />
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
