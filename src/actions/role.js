import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from '../constants/role';

export const fetchAllRoles = (roles) => ({
  type: types.RECEIVE_ROLES,
  roles,
});

export const setRoleStart = () => ({
  type: types.FETCH_ROLES_START,
});

export const setRoleError = (payload) => ({
  type: types.FETCH_ROLES_ERROR,
  payload,
});

export const postNewRole = (payload) => ({
  type: types.ADD_NEW_ROLE,
  payload,
});

export const modifyRole = (payload) => ({
  type: types.UPDATE_ROLE,
  payload,
});
export const getAllRoles = () => async (dispatch) => {
  const URL = ENDPOINTS.ROLES();
  const { data } = await axios.get(URL);
  return dispatch(fetchAllRoles(data));
};

export const addNewRole = (newRole) => async (dispatch) => {
  let role = {};
  let status = 200;
  try {
    const res = await axios.post(ENDPOINTS.ROLES(), newRole);
    role = res.data;
  } catch (error) {
    status = 400;
  }

  dispatch(postNewRole(role, status));
};

export const updateRole = (roleId, updatedRole) => async (dispatch) => {
  try {
    await axios.patch(ENDPOINTS.ROLES_BY_ID(roleId), updatedRole);
    dispatch(modifyRole(updatedRole));
  } catch (err) {
    dispatch(setRoleError());
  }
  dispatch(modifyRole(updatedRole));
};
