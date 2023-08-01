import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from "../constants/role";

export const fetchAllRoles = roles => {
  return {
    type: types.RECEIVE_ROLES,
    roles,
  };
};

export const postNewRole = payload => {
  return {
    type: types.ADD_NEW_ROLE,
    payload,
  };
};

export const modifyRole = payload => {
  return {
    type: types.UPDATE_ROLE,
    payload,
  };
};
export const getAllRoles = () => async dispatch => {
  const URL = ENDPOINTS.ROLES();
  const { data } = await axios.get(URL);
  return dispatch(fetchAllRoles(data));
};

export const addNewRole = newRole => {
  return async dispatch => {
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
};

export const updateRole = (roleId, updatedRole) => {
  return async dispatch => {
    try {
      const res = await axios.patch(ENDPOINTS.ROLES_BY_ID(roleId), updatedRole);
      dispatch(modifyRole(updatedRole));
    } catch (err) {
      dispatch(setRoleError());
    }
    dispatch(modifyRole(updatedRole));
  };
};

export const setRoleStart = () => {
  return {
    type: types.FETCH_ROLES_START,
  };
};

export const setRoleError = payload => {
  return {
    type: types.FETCH_ROLES_ERROR,
    payload,
  };
};