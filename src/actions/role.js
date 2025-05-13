import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../utils/URL';
import * as types from '../constants/role';

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
  return axios
    .post(ENDPOINTS.ROLES(), newRole)
    .then(res => {
      return res;
    })
    .catch(err => {
      if (err.response) return err.response;
      if (err.request) return err.request;
      return err.message;
    });
};

export const updateRole = (roleId, updatedRole) => {
  return async dispatch => {
    try {
      await axios.patch(ENDPOINTS.ROLES_BY_ID(roleId), updatedRole);
      dispatch(modifyRole(updatedRole));
      return 0;
    } catch (err) {
      dispatch(setRoleError());
      toast.error(err.message || 'Failed to update role.');
      return 1;
    }
  };
};
