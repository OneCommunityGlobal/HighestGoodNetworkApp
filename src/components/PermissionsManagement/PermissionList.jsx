import { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
// eslint-disable-next-line import/no-cycle
import PermissionListItem from './PermissionListItem';
import permissionLabel from './PermissionsConst';
import { getInfoCollections } from '../../actions/information';

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
  } = props;

  const dispatch = useDispatch();

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
          />
        ))}
      </ul>
    </div>
  );
}

export default connect(null, null)(PermissionList);
