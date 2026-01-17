import styles from '../Timelog/Timelog.module.css';
/**
 * Reusable component that enables the toggling of a user's active / inactive status
 * @param {bool} props.isActive
 * @param {int} props.index Used when rendering this component using the .map function
 * @param {func} props.onClick
 * @param {bool} props.canChange The permission to change the status via onClick
 */
function ActiveCell(props) {
  const { isActive, deactivatedAt, canChange, onClick, index } = props;

  const isScheduledForDeactivation = isActive && !!deactivatedAt;

  const className = (() => {
    if (!isActive) return styles.notActiveUser;          // grey
    if (isScheduledForDeactivation) return styles.scheduledUser; // orange
    return styles.activeUser;                            // green
  })();

  const title = (() => {
    if (!canChange) {
      if (!isActive) return 'Inactive';
      if (isScheduledForDeactivation) return 'Scheduled for deactivation';
      return 'Active';
    }

    if (isScheduledForDeactivation) {
      return 'User is scheduled for deactivation at end of day. Click here to cancel deactivation.';
    }

    return 'Click here to change the user status';
  })();

  return (
    <span
      style={{ fontSize: '1.5rem', cursor: canChange ? 'pointer' : 'default' }}
      className={className}
      id={index === undefined ? undefined : `active_cell_${index}`}
      title={title}
      aria-pressed={isActive}
      role={canChange ? 'button' : undefined}
      tabIndex={canChange ? 0 : -1}
      onClick={canChange ? onClick : () => {}}
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

