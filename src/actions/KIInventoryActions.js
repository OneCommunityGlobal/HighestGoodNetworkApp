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

/**
 * Fetch all inventory items across all categories.
 * GET /api/kitchenandinventory/inventory/items
 */
export const fetchInventoryItems = () => async dispatch => {
  dispatch({ type: KI_INVENTORY_FETCH_REQUEST });
  try {
    const res = await axios.get(ENDPOINTS.KI_INVENTORY_ITEMS);
    dispatch({ type: KI_INVENTORY_FETCH_SUCCESS, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: KI_INVENTORY_FETCH_FAILURE,
      payload: err.response?.data?.message || 'Failed to fetch inventory items.',
    });
  }
};

/**
 * Fetch inventory stats — total items, critical stock count, low stock count.
 * GET /api/kitchenandinventory/inventory/items/stats
 */
export const fetchInventoryStats = () => async dispatch => {
  dispatch({ type: KI_INVENTORY_STATS_REQUEST });
  try {
    const res = await axios.get(ENDPOINTS.KI_INVENTORY_STATS);
    dispatch({ type: KI_INVENTORY_STATS_SUCCESS, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: KI_INVENTORY_STATS_FAILURE,
      payload: err.response?.data?.message || 'Failed to fetch inventory stats.',
    });
  }
};

/**
 * Fetch preserved ingredient items (expiry >= 1 year from now).
 * GET /api/kitchenandinventory/inventory/items/ingredients/preserved
 */
export const fetchPreservedItems = () => async dispatch => {
  dispatch({ type: KI_PRESERVED_ITEMS_REQUEST });
  try {
    const res = await axios.get(ENDPOINTS.KI_INVENTORY_PRESERVED);
    dispatch({ type: KI_PRESERVED_ITEMS_SUCCESS, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: KI_PRESERVED_ITEMS_FAILURE,
      payload: err.response?.data?.message || 'Failed to fetch preserved items.',
    });
  }
};
