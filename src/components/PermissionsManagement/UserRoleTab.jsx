import React, { useEffect } from 'react';
import RolePermissions from './RolePermissions';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';

const UserRoleTab = props => {
  useEffect(() => {
    props.getUserRole(props.auth?.user.userid);
    const mode = localStorage.getItem('mode');
    document.body.className = mode
  }, []);
  const history = useHistory();

  const roleNames = props.roles.map(role => role.roleName);
  const userRoleParamsURL = props.match.params.userRole;
  const roleIndex = roleNames.findIndex(
    roleName => roleName.toLowerCase() === userRoleParamsURL.replace('-', ' '),
  );

  if (roleIndex === -1) {
    return (
      <div className="userRoleTab__container">
        <h1>Error</h1>
        <div>User Role not existent</div>
        <a href="/permissionsmanagement">Back to permissions management</a>
      </div>
    );
  }

  const actualRole = props.roles[roleIndex];
  const permissions = actualRole.permissions;
  const roleName = actualRole.roleName;
  const roleId = actualRole._id;

  return (
    <div className="userRoleTab__container">
      <button
        onClick={() => history.push('/permissionsmanagement')}
        className="userRoleTab__backBtn"
        style={boxStyle}
      >
        Back
      </button>
      <RolePermissions
        userRole={props.userProfile.role}
        role={roleName}
        roleId={roleId}
        header={`${roleName} Permissions:`}
        permissions={permissions}
      />
    </div>
  );
};

// export default UserRoleTab;
const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  getUserRole: id => dispatch(getUserProfile(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRoleTab);
