/**
 * Action: MATERIALS
 * Author: Gary Balogh - 09/28/23
 */
import axios from 'axios';
import * as types from '../constants/materials';
import { ENDPOINTS } from '../utils/URL';

/**
 *  MIDDLEWARE
 */

/**
 * Post new material to project in db
 * {
 *    projectId: string,
 *    material: string,
 *    newMaterial: boolean
 *    invoice: string,
 *    unitPrice: number,
 *    currency: string,
 *    quantity: number,
 *    measurement: string,
 *    newMeasurement: boolean
 *    purchaseDate: date,
 *    shippingFee: number,
 *    taxRate: number,
 *    phone: string,
 *    link: string,
 *    description: string
 * }
 */
export const postNewMaterial = (material) => {
  return async dispatch => {
    const url = ENDPOINTS.BM_ADD_NEW_MATERIAL;
    let status = null;

    try {
      const res = await axios.post(url, {
        material
      });
      status = res.status;
    } catch (err) {
      console.log("Error adding material");
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