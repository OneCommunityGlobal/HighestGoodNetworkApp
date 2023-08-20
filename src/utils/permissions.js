const hasPermission = (role, action, roles, userPermissions) => {

  if (role && roles && roles.length != 0) {
    const roleIndex = roles?.findIndex(({ roleName }) => roleName === role);
    let permissions = [];
    if (roleIndex !== -1) {
      permissions = roles[roleIndex].permissions;
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

//TODO: Remove usage of function when no longer needed
export const denyPermissionToSelfUpdateDevAdminDetails = (userEmail, isUserSelf) => {
  return false;

};

//TODO: Remove usage of function when no longer needed
export const denyPermissionForOthersToUpdateDevAdminDetails = (devAdminEmail, authEmail) => {
  return false;
};

export const deactivateOwnerPermission = (user, authRole) => {
  return user.role === 'Owner' && user.isActive && authRole !== 'Owner';
};

export default hasPermission;
