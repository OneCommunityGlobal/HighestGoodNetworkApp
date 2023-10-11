import axios from 'axios';
import * as types from '../constants/materials';
import { ENDPOINTS } from '../utils/URL';

import { addNewItemType } from './itemTypes';

/**
 *  MIDDLEWARE
 */

export const postNewMaterial = (formInputs) => {
  const material = {...formInputs};
  return async dispatch => {
    try {
      // add new inventory type if necessary
      if (material.newMaterial || material.newMeasurement) {
        const res1 = await axios.post(ENDPOINTS.BM_INVENTORY_TYPES, {
          type: 'material',
          name: material.material,
          description: material.description,
          uom: material.measurement,
          totalStock: material.quantity,
          totalAvailable: material.quantity,
          projectsUsing: [],
          imageUrl: '',
          link: material.link,
        });
        material.material = res1.data._id;
        dispatch(addNewItemType(res1.data));
      }
      const res = await axios.post(ENDPOINTS.BM_ADD_NEW_MATERIAL, { material });
      // possibly dispatch inventory material to state?
    } catch (error) {
      console.error(error);
    }
  };
};


/**
 * ACTIONS
 */

export const addNewMaterial = (payload, status) => {
  return {
    type: types.ADD_NEW_MATERIAL,
    payload,
    status,
  };
};