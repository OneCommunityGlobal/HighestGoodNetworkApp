import classnames from 'classnames';
import { ReportBlock } from '../ReportBlock';
import './ReportHeader.css';

export const ReportHeader = ({ children, isActive, src, avatar, name, counts, hoursContributed }) => {
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
                alt="Report profile picture"
                className="report-header-profile-pic"
              />
            )}
            <div className={classnames('report-header-activity', { active: isActive })} />
          </div>
          <div className="report-header-entity-name">{name}</div>
          <div className="report-header-entity-other-info">
            <span style={{fontSize: "20px"}}>{hoursContributed}</span> 
            {hoursContributed != null && (
              <>
                {hoursContributed === 1 ? <> hour committed</> : <> hours committed</>}
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
