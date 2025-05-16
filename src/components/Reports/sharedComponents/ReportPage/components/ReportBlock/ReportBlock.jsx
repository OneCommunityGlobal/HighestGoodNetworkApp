/* eslint-disable import/prefer-default-export */
import classnames from 'classnames';
import './ReportBlock.css';

export function ReportBlock({ className, children, firstColor, secondColor, darkMode }) {
  const color = secondColor
    ? `linear-gradient(to bottom right, ${firstColor}, ${secondColor})`
    : firstColor;

  let backgroundColor;
  if (secondColor) {
    backgroundColor = color;
  } else if (darkMode) {
    backgroundColor = '#3A506B';
  } else {
    backgroundColor = firstColor || 'white';
  }

  return (
    <div className={classnames(`${darkMode ? 'report-block-wrapper-dark' : 'report-block-wrapper'}`, className)}>
      <div className="report-block-content" style={{ background: backgroundColor }}>
        {children}
      </div>
    </div>
  );
}
