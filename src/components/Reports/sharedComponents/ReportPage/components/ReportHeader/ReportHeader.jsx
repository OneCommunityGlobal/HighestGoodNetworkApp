import classnames from 'classnames';
import { ReportBlock } from '../ReportBlock';
import './ReportHeader.css';

export const ReportHeader = ({ children, isActive, src, avatar, name, darkMode }) => {
  return (
    <ReportBlock darkMode={darkMode}>
      <header className="report-header">
        <div className="report-header-details">
          <div className="report-header-profile-pic-wrapper">
            {avatar ? (
              <div className={`${darkMode ? 'report-header-profile-pic-dark' : 'report-header-profile-pic'}`}>{avatar}</div>
            ) : (
              <img
                src={src || '/pfp-default.png'}
                alt="Report profile picture"
                className={`${darkMode ? 'report-header-profile-pic-dark' : 'report-header-profile-pic'}`}
              />
            )}
            <div className={classnames(`${darkMode ? 'report-header-activity-dark' :'report-header-activity'}`, { active: isActive })} />
          </div>
          <div className={`report-header-entity-name ${darkMode ? 'text-light' : ''}`}>{name}</div>
          {children}
        </div>
      </header>
    </ReportBlock>
  );
};
