import styles from '../Timelog/Timelog.module.css';
/**
 * Reusable component that enables the toggling of a user's active / inactive status
 * @param {bool} props.isActive
 * @param {int} props.index Used when rendering this component using the .map function
 * @param {func} props.onClick
 * @param {bool} props.canChange The permission to change the status via onClick
 */
function ActiveCell(props) {
  return (
    <span
      style={{ fontSize: '1.5rem', cursor: props.canChange ? 'pointer' : 'default' }}
      className={props.isActive ? styles.activeUser : styles.notActiveUser}
      id={props.index === undefined ? undefined : `active_cell_${props.index}`}
      title={(() => {
        if (props.canChange) {
          return 'Click here to change the user status';
        }
        return props.isActive ? 'Active' : 'Inactive';
      })()}
      aria-pressed={props.isActive}
      role={props.canChange ? 'button' : undefined}
      tabIndex={props.canChange ? 0 : -1}
      onClick={props.canChange ? props.onClick : () => { }}
      onKeyDown={
        props.canChange
          ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              props.onClick(e);
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
