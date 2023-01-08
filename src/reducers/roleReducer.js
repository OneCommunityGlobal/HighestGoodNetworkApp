import * as types from './../constants/role';

const initialState = {
  roles: [],
};

export const roleReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.RECEIVE_ROLES:
      const rolesSortByPermission = action.roles.sort(
        (a, b) => b.permissions.length - a.permissions.length,
      );
      return { ...state, roles: rolesSortByPermission };

    case types.ADD_NEW_ROLE:
      const toAdd = state.roles;
      toAdd.push(action.payload);
      return { ...state, roles: toAdd };

    case types.UPDATE_ROLE:
      const roleUpdated = action.payload;
      const indexRoleUpdated = state.roles.findIndex(
        role => role.roleName === roleUpdated.roleName,
      );
      const rolesCopy = state.roles;
      rolesCopy[indexRoleUpdated].permissions = roleUpdated.permissions;
      return { ...state, roles: rolesCopy };

    default:
      return state;
  }
};
