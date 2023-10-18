import axios from 'axios';
import * as types from '../constants/materials';
import { ENDPOINTS } from '../utils/URL';

import { addNewItemType } from './itemTypes';

/**
 *  MIDDLEWARE
 */

export const postMaterial = (formInputs) => {
  const material = {...formInputs};
  return async dispatch => {
    try {
      if (material.newMaterial || material.newMeasurement) {
        const res1 = await axios.post(ENDPOINTS.BM_INVENTORY_TYPES,
          {
            type: 'material',
            name: material.material,
            description: material.description,
            uom: material.measurement,
            totalStock: material.quantity,
            totalAvailable: material.quantity,
            projectsUsing: [],
            imageUrl: '',
            link: material.link,
          }
        );
        material.material = res1.data._id;
        dispatch(addNewItemType(res1.data));
      }
      const res = await axios.post(ENDPOINTS.BM_ADD_NEW_MATERIAL, { material });
      // TODO: dispatch new inventory material to state once created
    } catch (error) {
      // TODO: dispatch action that changes status that can be used
      // to show toast message
      console.error(error);
    }
  };
};


/**
 * ACTION CREATORS
 */

export const addMaterial = (payload, status) => {
  return {
    type: types.ADD_NEW_MATERIAL,
    payload,
    status,
  };
};