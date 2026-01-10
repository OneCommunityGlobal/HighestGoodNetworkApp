import classnames from 'classnames';
import { ReportBlock } from '../ReportBlock';
import styles from './ReportHeader.module.css';

export function ReportHeader({
  children,
  isActive,
  src,
  avatar,
  name,
  counts,
  hoursCommitted,
  darkMode,
}) {
  return (
    <ReportBlock darkMode={darkMode}>
      <header className={`${styles['report-header']} ${darkMode ? 'text-light' : ''}`}>
        <div className={styles['report-header-details']}>
          <div className={styles['report-header-profile-pic-wrapper']}>
            {avatar ? (
              <div
                className={`${
                  darkMode ? styles['report-header-profile-pic-dark'] : styles['report-header-profile-pic']
                }`}
                data-testid="avatar-wrapper"
              >
                {avatar}
              </div>
            ) : (
              <img
                src={src || '/pfp-default.png'}
                alt=""
                className={`${
                  darkMode ? styles['report-header-profile-pic-dark'] : styles['report-header-profile-pic']
                }`}
              />
            )}
            <div
              className={classnames(
                `${darkMode ? styles['report-header-activity-dark'] : styles['report-header-activity']}`,
                { [styles.active]: isActive },
              )}
            />
          </div>
          <div className={styles['report-header-entity-name']}>{name}</div>
          <div className={styles['report-header-entity-other-info']}>
            <span style={{ fontSize: '20px' }}>{hoursCommitted}</span>
            {hoursCommitted != null &&
              (hoursCommitted === 1 ? <> hour committed</> : <> hours committed</>)}
          </div>
          <div className={styles['report-header-entity-other-info']}>
            <span style={{ fontSize: '20px' }}>{counts?.activeMemberCount}</span>
            {counts?.activeMemberCount != null &&
              (counts.activeMemberCount === 1 ? <> active member</> : <> active members</>)}
          </div>
          <div className={styles['report-header-entity-other-info']}>
            <span style={{ fontSize: '20px' }}>{counts?.memberCount}</span>
            {counts?.memberCount != null &&
              (counts.memberCount === 1 ? <> total contributor</> : <> total contributors</>)}
          </div>
          {children}
        </div>
      </header>
    </ReportBlock>
  );
}
