import classnames from 'classnames';
import { ReportBlock } from '../ReportBlock';
import './ReportHeader.css';

export const ReportHeader = ({ children, isActive, src, avatar, name, counts, hoursCommitted, darkMode }) => {
  return (
    <ReportBlock darkMode={darkMode}>
      <header className={`report-header ${darkMode ? 'text-light' : ''}`}>
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
          <div className='report-header-entity-name'>{name}</div>
          <div className="report-header-entity-other-info">
            <span style={{fontSize: "20px"}}>{hoursCommitted}</span> 
            {hoursCommitted != null && (
              <>
                {hoursCommitted === 1 ? <> hour committed</> : <> hours committed</>}
              </>
            )}
          </div>
          <div className="report-header-entity-other-info">
            <span style={{fontSize: "20px"}}>{counts?.activeMemberCount}</span> 
            {counts?.activeMemberCount != null && (
              <>
                {counts.activeMemberCount === 1 ? <> active member</> : <> active members</>}
              </>
            )}
          </div>
          <div className="report-header-entity-other-info">
            <span style={{fontSize: "20px"}}>{counts?.memberCount}</span> 
            {counts?.memberCount != null && (
              <>
                {counts.memberCount === 1 ? <> total contributor</> : <> total contributors</>}
              </>
            )}
          </div>
          {children}
        </div>
      </header>
    </ReportBlock>
  );
};
