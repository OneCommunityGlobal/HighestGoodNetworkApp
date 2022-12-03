const hasPermission = (role, action, roles, userPermissions) => {
  if (role && roles && roles.length != 0) {
    const roleIndex = roles?.findIndex(({ roleName }) => roleName === role);

    const permissions = roles[roleIndex]?.permissions;

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