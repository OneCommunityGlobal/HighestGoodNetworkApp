import { useEffect } from 'react';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';
import RolePermissions from './RolePermissions';
import { permissionLabel } from './RolePermissions';

function UserRoleTab(props) {
  const { auth, roles, match, userProfile, getUserRole } = props;

  useEffect(() => {
    getUserRole(auth?.user.userid);
  }, []);
  const history = useHistory();

  const roleNames = roles.map(role => role.roleName);
  const userRoleParamsURL = match.params.userRole;
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

  const actualRole = roles[roleIndex];
  const { permissions } = actualRole;
  const { roleName } = actualRole;
  const roleId = actualRole._id;

  const permissionsList = [];

  Object.keys(permissionLabel).map(key => permissionsList.push(permissionLabel[key]));
  return (
    <div className="userRoleTab__container">
      <button
        type="button"
        onClick={() => history.push('/permissionsmanagement')}
        className="userRoleTab__backBtn"
        style={boxStyle}
      >
        Back
      </button>
      <RolePermissions
        userRole={userProfile.role}
        role={roleName}
        roleId={roleId}
        header={`${roleName} Permissions:`}
        permissionsList={permissionsList}
        permissions={permissions}
      />
    </div>
  );
}

// export default UserRoleTab;
const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
});

const mapDispatchToProps = dispatch => ({
  getUserRole: id => dispatch(getUserProfile(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRoleTab);
