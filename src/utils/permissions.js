import { store } from '../components/App';

const hasPermission = (action) => {
  const state = store.getState();
  const rolePermissions = state.role.roles;
  const userRole = state.auth.user.role;
  const userPermissions = state.auth.user.permissions.frontPermissions;

  if (userRole && rolePermissions && rolePermissions.length != 0) {
    const roleIndex = rolePermissions?.findIndex(({ roleName }) => roleName === userRole);
    let permissions = [];
    if (roleIndex !== -1) {
      permissions = rolePermissions[roleIndex].permissions;
    }

    let isAllowed;
    if (userPermissions && userPermissions.includes(action)) {
      isAllowed = true;
    } else if (permissions?.includes(action)) {
      isAllowed = true;
    } else {
      isAllowed = false;
    }

    return isAllowed;
  }
  return false;
};

export default hasPermission;
