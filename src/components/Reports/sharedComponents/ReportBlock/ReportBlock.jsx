import classnames from 'classnames';
import './ReportBlock.css';

export const ReportBlock = ({ className, children, firstColor, secondColor }) => {

  const color = secondColor ? `linear-gradient(to bottom right, ${firstColor}, ${secondColor})` : firstColor;

  return (
    <div className='report-block-wrapper'>
      <div className={classnames('report-block-content', className)} style={{background: color || 'white'}}>
        {children}
      </div>
    </div>
  )
}
