import { authReducer } from '../authReducer';
import { SET_CURRENT_USER, SET_HEADER_DATA } from '../../constants/auth';
import { isEmpty } from 'lodash';

describe('authReducer', () => {
  const initialState = {
    isAuthenticated: false,
    user: {},
    firstName: '',
    profilePic: '',
  };

  it('should return the initial state when action type is unknown', () => {
    const action = { type: 'UNKNOWN_ACTION' };
    expect(authReducer(undefined, action)).toEqual(initialState);
  });

  it('should handle SET_CURRENT_USER with null payload (logout scenario)', () => {
    const action = { type: SET_CURRENT_USER, payload: null };
    expect(authReducer(initialState, action)).toEqual(initialState);
  });

  it('should handle SET_CURRENT_USER with a new user', () => {
    const newUser = { new: true, id: '1', name: 'New User' };
    const action = { type: SET_CURRENT_USER, payload: newUser };
    const expectedState = {
      ...initialState,
      isAuthenticated: false,
      user: newUser,
    };
    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle SET_CURRENT_USER with a valid user (login scenario)', () => {
    const userPayload = { id: '123', name: 'John Doe' };
    const action = { type: SET_CURRENT_USER, payload: userPayload };
    const expectedState = {
      ...initialState,
      isAuthenticated: !isEmpty(userPayload),
      user: userPayload,
    };
    expect(authReducer(initialState, action)).toEqual(expectedState);
  });

  it('should handle SET_HEADER_DATA', () => {
    const headerData = {
      firstName: 'John',
      profilePic: 'path/to/profilePic.png',
    };
    const action = { type: SET_HEADER_DATA, payload: headerData };
    const expectedState = {
      ...initialState,
      firstName: headerData.firstName,
      profilePic: headerData.profilePic,
    };
    expect(authReducer(initialState, action)).toEqual(expectedState);
  });
});