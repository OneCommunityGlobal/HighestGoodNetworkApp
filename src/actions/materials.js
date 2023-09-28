/**
 * Action: MATERIALS
 * Author: Gary Balogh - 09/28/23
 */
import axios from 'axios';
import * as types from '../constants/materials';
import { ENDPOINTS } from '../utils/URL';

/**
 * Post new material to project in db
 * @param {newMaterial}: object containing info from add material form
 * {
 *    projectId: number,
 *    material: string,
 *    invoice: string,
 *    unitPrice: number,
 *    currency: string,
 *    quantity: number,
 *    measurement: string,
 *    purchaseDate: date,
 *    shippingFee: number,
 *    taxRate: number,
 *    phone: string,
 *    link: string,
 *    description: string
 * }
 */
export const addMaterial = (newMaterial) => {
  const url = ENDPOINTS.BM_ADD_NEW_MATERIAL;
  axios.post(url, newMaterial)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error(err);
  });
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