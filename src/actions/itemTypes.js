import {
  FETCH_ITEMTYPES_START,
  FETCH_ITEMTYPES_ERROR,
  RECEIVE_ITEMTYPES,
  ADD_NEW_ITEMTYPE,
} from '../reducers/itemTypeReducer';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

/**
 * MIDDLEWARE
 */

export const getAllItemTypes = () => {
  const res = axios.get(ENDPOINTS.BM_INVENTORY_TYPES);
  return async dispatch => {
    await dispatch(setItemTypesStart());
    res
      .then(res => {
        dispatch(setItemTypes(res.data));
      })
      .catch(err => {
        console.log(err);
        dispatch(setItemTypesError());
      });
  };
};

export const postNewItemType = (newItemType) => {
  return async dispatch => {
    try {
      const res = await axios.post(ENDPOINTS.BM_INVENTORY_TYPES, newItemType);
      dispatch(addNewItemType(res.data));
    } catch (err) {
      console.log(err);
    }
  };
};


/**
 * ACTIONS
 */

export const setItemTypesStart = () => {
  return {
    type: FETCH_ITEMTYPES_START,
  };
};

export const setItemTypes = (itemTypes) => {
  return {
    type: RECEIVE_ITEMTYPES,
    payload: itemTypes,
  };
};

export const setItemTypesError = () => {
  return {
    type: FETCH_ITEMTYPES_ERROR,
  };
};

export const addNewItemType = (newItemType) => {
  return {
    type: ADD_NEW_ITEMTYPE,
    payload: newItemType,
  };
};