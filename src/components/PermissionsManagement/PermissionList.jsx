import React from 'react';
import PermissionListItem from './PermissionListItem';
import permissionLabel from './PermissionsConst';
import { connect } from 'react-redux';


const PermissionList = (props) => {
  const { //the modifiable permissions for this role/user
          rolePermissions=[],
          //all permissions to be listed
          permissionsList=permissionLabel,
          // any additional permissions that cannot be added
          // (used for preventing adding permissions to users
          // which are already covered by their role)
          immutablePermissions=[],
          // if the add/remove buttons will appear
          editable=false,
          // used for indentation in subcategories/sublists
          depth=0,
          // function to update the permission list in parent component
          setPermissions=()=>{},
          // runs when permission is added or removed
          onChange=()=>{},
        } = props;


  return (
    <ul className="user-role-tab__permissionList">
        {permissionsList.map((permission) => (
          <PermissionListItem
            key={permission.label}
            rolePermissions={rolePermissions}
            immutablePermissions={immutablePermissions}
            label={permission.label}
            permission={permission.key}
            subperms={permission.subperms}
            description={permission.description}
            editable={editable}
            depth={depth}

            //functions
            setPermissions={setPermissions}
            onChange={onChange}
          />
        ))}
      </ul>
  );
};



const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionList);
