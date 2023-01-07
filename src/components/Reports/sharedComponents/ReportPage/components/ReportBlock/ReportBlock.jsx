import classnames from 'classnames';
import './ReportBlock.css';

export const ReportBlock = ({ className, children, firstColor, secondColor }) => {
  const color = secondColor
    ? `linear-gradient(to bottom right, ${firstColor}, ${secondColor})`
    : firstColor;

  return (
    <div className={classnames('report-block-wrapper', className)}>
      <div className="report-block-content" style={{ background: color || 'white' }}>
        {children}
      </div>
    </div>
  );
};
