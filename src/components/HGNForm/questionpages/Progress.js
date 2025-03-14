import '../styles/Progress.css';

function Progress({ progressValue }) {
  return (
    <div className="progress-hgn-container">
      <div className="progress-hgn-bar">
        <div
          className="progress-hgn"
          style={{ width: `${progressValue}%` }} // Dynamic width based on progress value (page number)
        />
      </div>
    </div>
  );
}

export default Progress;
