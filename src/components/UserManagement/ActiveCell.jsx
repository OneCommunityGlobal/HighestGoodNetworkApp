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
      className={props.isActive ? 'isActive' : 'isNotActive'}
      id={props.index === undefined ? undefined : `active_cell_${props.index}`}
      title={
        props.canChange
          ? 'Click here to change the user status'
          : props.isActive
          ? 'Active'
          : 'Inactive'
      }
      onClick={props.canChange ? props.onClick : () => {}}
    >
      <i className="fa fa-circle" aria-hidden="true" />
    </span>
  );
}

export default ActiveCell;
