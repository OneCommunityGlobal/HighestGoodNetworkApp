import classnames from 'classnames';
import { ReportBlock } from '../ReportBlock';
import './ReportHeader.css';

export const ReportHeader = ({ children, isActive, src, avatar }) => {
  return (
    <ReportBlock>
      <header className='report-header'>
        <div className='report-header-details'>
          <div className="report-header-profile-pic-wrapper">
            {avatar ?? <img src={src || '/pfp-default.png'} alt="Report profile picture" className="report-header-profile-pic" />}
            <div className={classnames('report-header-activity', { active: isActive })} />
          </div>
          {children}
        </div>
      </header>
    </ReportBlock>
  )
}