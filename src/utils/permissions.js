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

// cannot self update the details for devadmin@hgn.net in UserProfile
export const denyPermissionToSelfUpdateDevAdminDetails = (userEmail, isUserSelf) => {
  return userEmail === "devadmin@hgn.net" && isUserSelf;

};

// others cannot change the details for devadmin@hgn.net
export const denyPermissionForOthersToUpdateDevAdminDetails = (devAdminEmail, authEmail) => {
  //const permissionToEdit = ['jae@onecommunityglobal.org', 'one.community@me.com', 'jsabol@me.com', 'nidazaki97@gmail.com']
  return (devAdminEmail === "devadmin@hgn.net" && (authEmail !== "jae@onecommunityglobal.org"))
};

export const deactivateOwnerPermission = (user, authRole) => {
  return user.role === 'Owner' && user.isActive && authRole !== 'Owner';
};

export default hasPermission;
