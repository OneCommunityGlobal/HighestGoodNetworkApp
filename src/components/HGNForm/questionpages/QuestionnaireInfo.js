import '../styles/QuestionnaireInfo.css';

function QuestionnaireInfo() {
  return (
    <div className="questionnaire-info">
      <div className="blue-strip" />
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
      <p className="required" style={{ color: 'red', margin: '15px' }}>
        * Indicates required question
      </p>
    </div>
  );
}

export default QuestionnaireInfo;
