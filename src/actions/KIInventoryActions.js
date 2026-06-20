import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  KI_INVENTORY_FETCH_REQUEST,
  KI_INVENTORY_FETCH_SUCCESS,
  KI_INVENTORY_FETCH_FAILURE,
  KI_INVENTORY_STATS_REQUEST,
  KI_INVENTORY_STATS_SUCCESS,
  KI_INVENTORY_STATS_FAILURE,
  KI_PRESERVED_ITEMS_REQUEST,
  KI_PRESERVED_ITEMS_SUCCESS,
  KI_PRESERVED_ITEMS_FAILURE,
} from '../constants/KIInventoryConstants';

const createFetchAction = (requestType, successType, failureType, endpoint, defaultErrorMsg) => async dispatch => {
  dispatch({ type: requestType });
  try {
    const res = await axios.get(endpoint);
    dispatch({ type: successType, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: failureType,
      payload: err.response?.data?.message || defaultErrorMsg,
    });
  }
};

/**
 * Fetch all inventory items across all categories.
 * GET /api/kitchenandinventory/inventory/items
 */
export const fetchInventoryItems = () => createFetchAction(
  KI_INVENTORY_FETCH_REQUEST,
  KI_INVENTORY_FETCH_SUCCESS,
  KI_INVENTORY_FETCH_FAILURE,
  ENDPOINTS.KI_INVENTORY_ITEMS,
  'Failed to fetch inventory items.'
);

/**
 * Fetch inventory stats — total items, critical stock count, low stock count.
 * GET /api/kitchenandinventory/inventory/items/stats
 */
export const fetchInventoryStats = () => createFetchAction(
  KI_INVENTORY_STATS_REQUEST,
  KI_INVENTORY_STATS_SUCCESS,
  KI_INVENTORY_STATS_FAILURE,
  ENDPOINTS.KI_INVENTORY_STATS,
  'Failed to fetch inventory stats.'
);

/**
 * Fetch preserved ingredient items (expiry >= 1 year from now).
 * GET /api/kitchenandinventory/inventory/items/ingredients/preserved
 */
export const fetchPreservedItems = () => createFetchAction(
  KI_PRESERVED_ITEMS_REQUEST,
  KI_PRESERVED_ITEMS_SUCCESS,
  KI_PRESERVED_ITEMS_FAILURE,
  ENDPOINTS.KI_INVENTORY_PRESERVED,
  'Failed to fetch preserved items.'
);
