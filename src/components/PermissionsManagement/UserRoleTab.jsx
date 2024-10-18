import { useEffect } from 'react';
import { connect } from 'react-redux';
import './UserRoleTab.css';
import { getUserProfile } from 'actions/userProfile';
import { useHistory } from 'react-router-dom';
import { boxStyle, boxStyleDark } from 'styles';
import RolePermissions from './RolePermissions';

function UserRoleTab(props) {
  const { darkMode } = props;

  useEffect(() => {
    props.getUserRole(props.auth?.user.userid);
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
  const { permissions } = actualRole;
  const { roleName } = actualRole;
  const roleId = actualRole._id;

  return (
    <div className={darkMode ? 'bg-oxford-blue text-light' : ''}>
      <div className="userRoleTab__container pb-5">
        <button
          type="button"
          onClick={() => history.push('/permissionsmanagement')}
          className="userRoleTab__backBtn"
          style={darkMode ? boxStyleDark : boxStyle}
        >
          Back
        </button>
        <RolePermissions
          userRole={props.userProfile.role}
          role={roleName}
          roleId={roleId}
          header={`${roleName} Permissions:`}
          permissions={permissions}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  roles: state.role.roles,
  auth: state.auth,
  userProfile: state.userProfile,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  // eslint-disable-next-line no-undef
  getAllRoles: () => dispatch(getAllRoles()),
  getUserRole: id => dispatch(getUserProfile(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRoleTab);
