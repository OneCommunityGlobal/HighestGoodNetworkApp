
const hasPermission = (action) => {
  return (dispatch, getState) => {
    const state = getState();
    const rolePermissions = state.role.roles;
    const userRole = state.auth.user.role;
    const userPermissions = state.auth.user.permissions?.frontPermissions;

    if (userRole && rolePermissions && rolePermissions.length != 0) {
      const roleIndex = rolePermissions?.findIndex(({ roleName }) => roleName === userRole);
      let permissions = [];
      if (roleIndex !== -1) {
        permissions = rolePermissions[roleIndex].permissions;
      }

      return userPermissions?.includes(action) || permissions?.includes(action);
    }
    return false;
  }
};

// others cannot change the details for devadmin@hgn.net
export const cantUpdateDevAdminDetails = (devAdminEmail, authEmail) => (
  devAdminEmail === "devadmin@hgn.net"
  && (
    authEmail !== "jae@onecommunityglobal.org"
    // || authEmail !== "one.community@me.com"
    // || authEmail !== "jsabol@me.com "
  )
);


export const cantDeactivateOwner = (user, authRole) => {
  return user.role === 'Owner' && user.isActive && authRole !== 'Owner';
};

export default hasPermission;
