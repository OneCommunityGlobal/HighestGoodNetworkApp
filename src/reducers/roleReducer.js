import * as types from '../constants/role';

const initialState = {
  roles: [],
};

// eslint-disable-next-line default-param-last
export const roleReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.RECEIVE_ROLES: {
      // Wrap in braces to fix lexical declaration issue
      const rolesSortByPermission = [...action.roles].sort(
        (a, b) => b.permissions.length - a.permissions.length,
      );
      return { ...state, roles: rolesSortByPermission };
    }

    case types.ADD_NEW_ROLE: {
      // Wrap in braces to fix lexical declaration issue
      return { ...state, roles: [...state.roles, action.payload] };
    }

    case types.UPDATE_ROLE: {
      // Wrap in braces to fix lexical declaration issue
      const roleUpdated = action.payload;
      const updatedRoles = state.roles.map(role => {
        if (role._id === roleUpdated.roleId) {
          return {
            ...role,
            roleName: roleUpdated.roleName || role.roleName,
            permissions: roleUpdated.permissions,
          };
        }
        return role;
      });
      return { ...state, roles: updatedRoles };
    }

    default:
      return state;
  }
};

export default roleReducer;
