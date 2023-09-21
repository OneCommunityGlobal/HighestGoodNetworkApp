/**
 * Reusable component that enables the toggling of a user's active / inactive status
 * @param {bool} props.isActive
 * @param {int} props.index Used when rendering this component using the .map function
 * @param {func} props.onClick
 * @param {bool} props.canChange The permission to change the status via onClick
 */
function ActiveCell(props) {
  const { canChange, isActive, index, onClick } = props;
  return (
    <span
      style={{ fontSize: '1.5rem', cursor: canChange ? 'pointer' : 'default' }}
      className={isActive ? 'isActive' : 'isNotActive'}
      id={index === undefined ? undefined : `active_cell_${index}`}
      title={canChange ? 'Click here to change the user status' : isActive ? 'Active' : 'Inactive'}
      onClick={canChange ? onClick : () => {}}
    >
      <i className="fa fa-circle" aria-hidden="true" />
    </span>
  );
}

export default ActiveCell;
