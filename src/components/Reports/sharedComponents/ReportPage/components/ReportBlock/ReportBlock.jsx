import './ReportBlock.css';

export const ReportBlock = ({ className, children, firstColor, secondColor, darkMode }) => {
  const color = secondColor
    ? `linear-gradient(to bottom right, ${firstColor}, ${secondColor})`
    : firstColor;

  return (
    <div className={`${className ? className : ''} ${darkMode ? 'report-block-wrapper-dark' : 'report-block-wrapper'}`}>
      <div className="report-block-content" style={{ background: secondColor ? color : darkMode ? '#3A506B' : firstColor || 'white' }}>
        {children}
      </div>
    </div>
  );
};
