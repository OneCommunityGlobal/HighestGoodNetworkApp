import React from "react";
import "../styles/Progress.css";

const Progress = ({progressValue}) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progressValue}%` }} // Dynamic width based on progress value (page number)
        ></div>
      </div>
    </div>
  );
};

export default Progress;
