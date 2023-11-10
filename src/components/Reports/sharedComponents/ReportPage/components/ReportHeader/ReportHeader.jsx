import classnames from 'classnames';
import ReportBlock from '../ReportBlock/ReportBlock';
import './ReportHeader.css';

export default function ReportHeader({ children, isActive, src, avatar, name }) {
  return (
    <ReportBlock>
      <header className="report-header">
        <div className="report-header-details">
          <div className="report-header-profile-pic-wrapper">
            {avatar ? (
              <div className="report-header-profile-pic">{avatar}</div>
            ) : (
              <img
                src={src || '/pfp-default.png'}
                alt="Report profile"
                className="report-header-profile-pic"
              />
            )}
            <div className={classnames('report-header-activity', { active: isActive })} />
          </div>
          <div className="report-header-entity-name">{name}</div>
          {children}
        </div>
      </header>
    </ReportBlock>
  );
}
