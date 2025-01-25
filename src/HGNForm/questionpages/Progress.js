import '../styles/Progress.css';

function Progress({ progressValue }) {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${progressValue}%` }} // Dynamic width based on progress value (page number)
        />
      </div>
    </div>
  );
}

export default Progress;
