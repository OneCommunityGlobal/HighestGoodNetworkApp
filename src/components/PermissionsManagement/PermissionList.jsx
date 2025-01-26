import { useContext } from 'react';
import { connect } from 'react-redux';
// eslint-disable-next-line import/no-cycle
import PermissionListItem from './PermissionListItem';
import permissionLabel from './PermissionsConst';
import { PermissionsContext, PermissionsProvider } from './PermissionsContext';

function PermissionList(props) {
  const {
    // the modifiable permissions for this role/user
    // rolePermissions = [],
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
    // setPermissions = () => {},
    // runs when permission is added or removed
    // onChange = () => {},
    userProfile,
  } = props;

  // console.log('PermissionList rolePermissions:', rolePermissions);
  // console.log('PermissionList permissionsList:', permissionsList);
  // console.log('PermissionList immutablePermissions:', immutablePermissions);

  const { currentUserPermissions, handlePermissionsChange } = useContext(PermissionsContext);

  const handlePermissionToggle = updatedPermissions => {
    console.log('handlePermissionToggle called with:', updatedPermissions);
    // setPermissions(updatedPermissions);
    // onChange(updatedPermissions);
    handlePermissionsChange(updatedPermissions);
  };

  return (
    <PermissionsProvider userProfile={userProfile}>
      <ul className="user-role-tab__permissionList">
        {permissionsList.map(permission => (
          <PermissionListItem
            key={permission.label}
            /* rolePermissions={rolePermissions} */
            rolePermissions={currentUserPermissions}
            immutablePermissions={immutablePermissions}
            label={permission.label}
            permission={permission.key}
            subperms={permission.subperms}
            description={permission.description}
            editable={editable}
            depth={depth}
            // eslint-disable-next-line react/destructuring-assignment
            darkMode={props.darkMode}
            // functions
            setPermissions={handlePermissionToggle}
            onChange={handlePermissionToggle}
          />
        ))}
      </ul>
    </PermissionsProvider>
  );
}

export default connect(null, null)(PermissionList);
