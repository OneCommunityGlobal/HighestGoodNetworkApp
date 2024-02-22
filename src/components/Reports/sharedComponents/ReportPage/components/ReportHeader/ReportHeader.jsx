import classnames from 'classnames';
import { ReportBlock } from '../ReportBlock';
import './ReportHeader.css';

export const ReportHeader = ({ children, isActive, src, avatar, name, counts }) => {
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
          <div>Total Contribution: {}</div>
          <div>Active Members: {counts.activeMemberCount}</div>
          <div>Total Contributors: {counts.memberCount}</div>
          {children}
        </div>
      </header>
    </ReportBlock>
  );
};
