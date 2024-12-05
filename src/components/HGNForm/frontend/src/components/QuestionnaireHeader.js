import React, { forwardRef } from "react";
import "../styles/QuestionnaireInfo.css";

const QuestionnaireHeader = forwardRef((props, ref) => {
  return (
    <div className="questionnaire-info" ref={ref}>
      <div className="blue-strip"></div>
      <h1 style={{ marginBottom: 0 }}>HGN Development Team Questionnaire</h1>
      <hr />
      <p style={{ marginBottom: "10px" }}>BM'S Account</p>
    </div>
  );
});

export default QuestionnaireHeader;
