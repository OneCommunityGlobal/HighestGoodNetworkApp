/**
 *
 * @param {string} action
 * @param {boolean} viewingUser indicate whether to check authUser or other user. Default to `false`
 * @returns
 */
const hasPermission = (action, viewingUser = false) => {
  return (dispatch, getState) => {
    const state = getState();
    const rolePermissions = state.role.roles;
    const userRole = viewingUser ? state.userProfile.role : state.auth.user.role;
    const userPermissions = viewingUser
      ? state.userProfile.permissions?.frontPermissions
      : state.auth.user.permissions?.frontPermissions;
    if (userRole && rolePermissions && rolePermissions.length !== 0) {
      const roleIndex = rolePermissions?.findIndex(({ roleName }) => roleName === userRole);
      let permissions = [];
      if (roleIndex !== -1) {
        permissions = rolePermissions[roleIndex].permissions;
      }
      return userPermissions?.includes(action) || permissions?.includes(action);
    }
    return false;
  };
};

/**
 * Return true if the user is not allowed to update the protected accounts
 * @param {String} devAdminEmail target user email
 * @param {String} authEmail logged in user email
 * @returns {boolean} true if the user is not allowed to update the devadmin details
 */
export const cantUpdateDevAdminDetails = (devAdminEmail, authEmail) => {
  const allowedEmails = ['jae@onecommunityglobal.org', 'one.community@me.com', 'jsabol@me.com'];
  const protectedEmails = [
    'jae@onecommunityglobal.org',
    'one.community@me.com',
    'jsabol@me.com',
    'devadmin@hgn.net',
  ];
  return protectedEmails.includes(devAdminEmail) && !allowedEmails.includes(authEmail);
};

export const cantDeactivateOwner = (user, authRole) => {
  return user.role === 'Owner' && user.isActive && authRole !== 'Owner';
};

export default hasPermission;
