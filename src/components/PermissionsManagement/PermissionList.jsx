import { useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
// eslint-disable-next-line import/no-cycle
import PermissionListItem from './PermissionListItem';
import permissionLabel from './PermissionsConst';
import { getInfoCollections } from '../../actions/information';
import styles from './UserRoleTab.module.css';

// every heading label in the list, nested headings included
const getHeadingLabels = list =>
  list.flatMap(item => (item.subperms ? [item.label, ...getHeadingLabels(item.subperms)] : []));

function PermissionList(props) {
  const {
    // the modifiable permissions for this role/user
    rolePermissions = [],
    // all permissions to be listed
    permissionsList = permissionLabel,
    // any additional permissions that cannot be added
    // (used for preventing adding permissions to users
    // which are already covered by their role)
    immutablePermissions = [],
    // if the add/remove buttons will appear
    editable = false,
    // used for indentation in subcategories/sublists
    depth = 0,
    // function to update the permission list in parent component
    setPermissions = () => {},
    // runs when permission is added or removed
    onChange = () => {},

    removedDefaultPermissions = [],

    setRemovedDefaultPermissions = () => {},

    editPermission,
    // true only for the sub-list that PermissionListItem draws under a heading
    isNested = false,
    // sub-lists only: the outer list's closed headings and its open/close function
    closedHeadings: outerClosedHeadings,
    onToggleHeading: outerToggleHeading,
  } = props;

  const dispatch = useDispatch();
  // read from the store like PermissionListItem does: 2 of the 4 screens pass no darkMode prop
  const darkMode = useSelector(state => state.theme.darkMode);

  // Labels of the headings someone has closed. It starts empty, so every visit starts with
  // every heading open. Only the outer list's Set is used: sub-lists get it as a prop, so a
  // nested heading stays closed when its parent heading is closed and opened again.
  const [closedHeadings, setClosedHeadings] = useState(() => new Set());

  const toggleHeading = label => {
    setClosedHeadings(previous => {
      // a new Set, so React sees the change and draws the list again
      const next = new Set(previous);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const openAll = () => setClosedHeadings(new Set());
  const collapseAll = () => setClosedHeadings(new Set(getHeadingLabels(permissionsList)));

  // Ask the server for all saved info texts ONCE per list (the row icons use skipFetch
  // and read the texts from the store). Decided by isNested, not by depth: on mobile,
  // sub-lists keep depth 0.
  useEffect(() => {
    if (!isNested) {
      dispatch(getInfoCollections());
    }
  }, [dispatch, isNested]);

  return (
    <div className="user-role-tab__permissionList" data-testid="permission-list">
      {' '}
      {/* Only above the outer list. type="button": two screens put this list inside a form */}
      {!isNested && (
        <div className={styles.openCloseAll}>
          <Button
            type="button"
            size="sm"
            color="secondary"
            onClick={openAll}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Open all
          </Button>
          <Button
            type="button"
            size="sm"
            color="secondary"
            onClick={collapseAll}
            style={darkMode ? boxStyleDark : boxStyle}
          >
            Collapse all
          </Button>
        </div>
      )}
      <ul>
        {permissionsList.map(permission => (
          <PermissionListItem
            key={permission.label}
            rolePermissions={rolePermissions}
            immutablePermissions={immutablePermissions}
            removedDefaultPermissions={removedDefaultPermissions}
            setRemovedDefaultPermissions={setRemovedDefaultPermissions}
            label={permission.label}
            permission={permission.key}
            subperms={permission.subperms}
            description={permission.description}
            editable={editable}
            depth={depth}
            editPermission={editPermission}
            // eslint-disable-next-line react/destructuring-assignment
            darkMode={props.darkMode}
            // functions
            setPermissions={setPermissions}
            onChange={onChange}
            closedHeadings={isNested ? outerClosedHeadings : closedHeadings}
            onToggleHeading={isNested ? outerToggleHeading : toggleHeading}
          />
        ))}
      </ul>
    </div>
  );
}

export default connect(null, null)(PermissionList);
