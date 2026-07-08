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
  KI_INVENTORY_ADD_REQUEST,
  KI_INVENTORY_ADD_SUCCESS,
  KI_INVENTORY_ADD_FAILURE,
  KI_INVENTORY_UPDATE_REQUEST,
  KI_INVENTORY_UPDATE_SUCCESS,
  KI_INVENTORY_UPDATE_FAILURE,
  KI_INVENTORY_DELETE_REQUEST,
  KI_INVENTORY_DELETE_SUCCESS,
  KI_INVENTORY_DELETE_FAILURE,
} from '../constants/KIInventoryConstants';

const createFetchAction = (
  requestType,
  successType,
  failureType,
  endpoint,
  defaultErrorMsg,
) => async dispatch => {
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

/**
 * Add a new inventory item.
 * POST /api/kitchenandinventory/inventory/items
 */
export const addInventoryItem = payload => async dispatch => {
  dispatch({ type: KI_INVENTORY_ADD_REQUEST });

  try {
    const res = await axios.post(ENDPOINTS.KI_INVENTORY_ITEMS, payload);
    dispatch({ type: KI_INVENTORY_ADD_SUCCESS, payload: res.data?.data || res.data });

    await Promise.all([
      dispatch(fetchInventoryItems()),
      dispatch(fetchInventoryStats()),
      dispatch(fetchPreservedItems()),
    ]);

    return res.data;
  } catch (err) {
    const notFoundMessage =
      'Inventory add route was not found. Please confirm the backend is running with the Kitchen and Inventory inventory routes.';
    const errorMessage =
      err.response?.status === 404
        ? notFoundMessage
        : err.response?.data?.message || err.message || 'Failed to add inventory item.';

    dispatch({
      type: KI_INVENTORY_ADD_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Update an inventory item.
 * PUT /api/kitchenandinventory/inventory/items/:itemId
 */
export const updateInventoryItem = (itemId, payload) => async dispatch => {
  dispatch({ type: KI_INVENTORY_UPDATE_REQUEST });

  try {
    const res = await axios.put(ENDPOINTS.KI_INVENTORY_ITEM(itemId), payload);
    dispatch({ type: KI_INVENTORY_UPDATE_SUCCESS, payload: res.data?.data || res.data });

    await Promise.all([
      dispatch(fetchInventoryItems()),
      dispatch(fetchInventoryStats()),
      dispatch(fetchPreservedItems()),
    ]);

    return res.data;
  } catch (err) {
    const notFoundMessage =
      'Inventory update route was not found. Please confirm the backend is running with the item update route.';
    const errorMessage =
      err.response?.status === 404
        ? notFoundMessage
        : err.response?.data?.message || err.message || 'Failed to update inventory item.';

    dispatch({
      type: KI_INVENTORY_UPDATE_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Delete an inventory item.
 * DELETE /api/kitchenandinventory/inventory/items/:itemId
 */
export const deleteInventoryItem = itemId => async dispatch => {
  dispatch({ type: KI_INVENTORY_DELETE_REQUEST });

  try {
    const res = await axios.delete(ENDPOINTS.KI_INVENTORY_ITEM(itemId));
    dispatch({ type: KI_INVENTORY_DELETE_SUCCESS, payload: itemId });

    await Promise.all([
      dispatch(fetchInventoryItems()),
      dispatch(fetchInventoryStats()),
      dispatch(fetchPreservedItems()),
    ]);

    return res.data;
  } catch (err) {
    const notFoundMessage =
      'Inventory delete route was not found. Please confirm the backend is running with the item delete route.';
    const errorMessage =
      err.response?.status === 404
        ? notFoundMessage
        : err.response?.data?.message || err.message || 'Failed to delete inventory item.';

    dispatch({
      type: KI_INVENTORY_DELETE_FAILURE,
      payload: errorMessage,
    });

    throw new Error(errorMessage);
  }
};
