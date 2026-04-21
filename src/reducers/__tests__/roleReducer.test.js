import { roleReducer } from '../roleReducer';
import * as types from '../../constants/role';

describe('roleReducer', () => {
  const initialState = {
    roles: [],
  };

  it('should return the initial state when an action type is not passed', () => {
    expect(roleReducer(undefined, {})).toEqual(initialState);
  });

  it('should handle RECEIVE_ROLES by sorting roles based on permissions length', () => {
    const action = {
      type: types.RECEIVE_ROLES,
      roles: [
        { _id: '1', roleName: 'Role1', permissions: ['p1', 'p2'] },
        { _id: '2', roleName: 'Role2', permissions: ['p1'] },
      ],
    };

    const expectedState = {
      roles: [
        { _id: '1', roleName: 'Role1', permissions: ['p1', 'p2'] },
        { _id: '2', roleName: 'Role2', permissions: ['p1'] },
      ],
    };

    expect(roleReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle ADD_NEW_ROLE by adding the new role to the state', () => {
    const action = {
      type: types.ADD_NEW_ROLE,
      payload: { _id: '3', roleName: 'NewRole', permissions: ['p1'] },
    };

    const initial = {
      roles: [{ _id: '1', roleName: 'Role1', permissions: ['p1', 'p2'] }],
    };

    const expectedState = {
      roles: [
        { _id: '1', roleName: 'Role1', permissions: ['p1', 'p2'] },
        { _id: '3', roleName: 'NewRole', permissions: ['p1'] },
      ],
    };

    expect(roleReducer(initial, action)).toEqual(expectedState);
  });

  it('should handle UPDATE_ROLE by updating an existing role in the state', () => {
    const action = {
      type: types.UPDATE_ROLE,
      payload: {
        roleId: '1',
        roleName: 'UpdatedRole',
        permissions: ['p1', 'p3'],
      },
    };

    const initial = {
      roles: [
        { _id: '1', roleName: 'Role1', permissions: ['p1', 'p2'] },
        { _id: '2', roleName: 'Role2', permissions: ['p1'] },
      ],
    };

    const expectedState = {
      roles: [
        { _id: '1', roleName: 'UpdatedRole', permissions: ['p1', 'p3'] },
        { _id: '2', roleName: 'Role2', permissions: ['p1'] },
      ],
    };

    expect(roleReducer(initial, action)).toEqual(expectedState);
  });

  it('should return the current state for unknown action types', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    const currentState = { roles: [{ _id: '1', roleName: 'Role1', permissions: ['p1'] }] };

    expect(roleReducer(currentState, action)).toEqual(currentState);
  });
});
