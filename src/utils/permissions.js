
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
export const cantUpdateDevAdminDetails = (devAdminEmail, authEmail) => {
  const allowedEmails = ['jae@onecommunityglobal.org',
                         'one.community@me.com',
                         'jsabol@me.com'
                        ]
  const protectedEmails = ['jae@onecommunityglobal.org',
                           'one.community@me.com',
                           'jsabol@me.com',
                           'devadmin@hgn.net'
                          ]
  return protectedEmails.includes(devAdminEmail) && !allowedEmails.includes(authEmail);
};


export const cantDeactivateOwner = (user, authRole) => {
  return user.role === 'Owner' && user.isActive && authRole !== 'Owner';
};

export default hasPermission;
