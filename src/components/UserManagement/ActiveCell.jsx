import moment from 'moment';
import styles from '../Timelog/Timelog.module.css';
import { UserStatus } from '../../utils/enums';

function ActiveCell(props) {
  const {
    isActive,
    endDate,
    reactivationDate,
    canChange,
    onClick,
    index,
  } = props;

  const now = moment();

  function deriveUserStatus({ isActive, reactivationDate, endDate }) {
  if (reactivationDate) return UserStatus.Paused;
  if (isActive && !!endDate && moment(endDate).isAfter(now)) return UserStatus.Scheduled;
  if (endDate) return UserStatus.Inactive;
  if (isActive) return UserStatus.Active;
}

  const isScheduled = deriveUserStatus({ isActive, reactivationDate, endDate }) === UserStatus.Scheduled;
  const isPaused = deriveUserStatus({ isActive, reactivationDate, endDate }) === UserStatus.Paused;
  const isSeparated = deriveUserStatus({ isActive, reactivationDate, endDate }) === UserStatus.Inactive;


  const className = (() => {
    // 1️⃣ Paused users 
    if(isPaused) return styles.pausedUser;               // red  

    // 2️⃣ Inactive users are NEVER green
    if (isSeparated)
      return styles.notActiveUser;                  // grey (default inactive)

    // 3️⃣ Active but scheduled
    if (isScheduled) return styles.scheduledUser;   // orange

    // 4️⃣ Truly active
    return styles.activeUser;                       // green
  })();


  const title = (() => {
    if (!canChange) {
      if (isScheduled) return 'Scheduled for deactivation';
      if (isPaused) return 'Paused';
      if (isSeparated) return 'Inactive';
      return 'Active';
    }

    if (isScheduled) {
      return 'User has a final day scheduled. Click to manage.';
    }

    if (isPaused) {
      return 'User is paused. Click to resume or manage.';
    }

    if (isSeparated) {
      return 'User is inactive.';
    }

    return 'Click to change user status';
  })();

  return (
    <span
      style={{ fontSize: '1.5rem', cursor: canChange ? 'pointer' : 'default' }}
      className={className}
      id={index === undefined ? undefined : `active_cell_${index}`}
      title={title}
      role={canChange ? 'button' : undefined}
      tabIndex={canChange ? 0 : -1}
      onClick={canChange ? onClick : undefined}
      onKeyDown={
        canChange
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      <i className={`fa fa-circle ${styles['fa-circle']}`} aria-hidden="true" />
    </span>
  );
}

export default ActiveCell;