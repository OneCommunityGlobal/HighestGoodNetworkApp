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

// cannot update the password for devadmin@hgn.net in UserProfile
export const denyPermissionToUpdatePassword = (email, authRole) => {
  if (email === "devadmin@hgn.net") {
    return true;
  }
};

// cannot reset the password for devadmin@hgn.net in User Management 
export const denyPermissionToResetPassword = (devAdminEmail, authEmail) => {
  return (devAdminEmail === "devadmin@hgn.net" && (authEmail !== "jae@onecommunityglobal.org" || authEmail !== "one.community@me.com"
    || authEmail !== "jsabol@me.com"));
};

export const deactivateOwnerPermission = (user, authRole) => {
  return user.role === 'Owner' && user.isActive && authRole !== 'Owner';
};

export default hasPermission;
