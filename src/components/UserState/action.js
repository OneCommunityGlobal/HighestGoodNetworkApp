import axios from "axios";
import { createAction } from "redux-actions";

export const fetchUserStateCatalogBegin = createAction("FETCH_USER_STATE_CATALOG_BEGIN");
export const fetchUserStateCatalogSuccess = createAction("FETCH_USER_STATE_CATALOG_SUCCESS");
export const fetchUserStateCatalogError = createAction("FETCH_USER_STATE_CATALOG_ERROR");

export const updateUserStateBegin = createAction("UPDATE_USER_STATE_BEGIN");
export const updateUserStateSuccess = createAction("UPDATE_USER_STATE_SUCCESS");
export const updateUserStateError = createAction("UPDATE_USER_STATE_ERROR");

const API_BASE = "/api/user-states";

export const fetchUserStateCatalog = () => async (dispatch) => {
  dispatch(fetchUserStateCatalogBegin());
  try {
    const { data } = await axios.get(`${API_BASE}/catalog`);
    dispatch(fetchUserStateCatalogSuccess(data.items));
  } catch (err) {
    dispatch(fetchUserStateCatalogError(err));
  }
};

export const updateUserStateIndicators = (userId, selectedKeys) => async (dispatch) => {
  dispatch(updateUserStateBegin());
  try {
    const { data } = await axios.patch(`${API_BASE}/users/${userId}/state-indicators`, {
      selectedKeys,
    });
    dispatch(updateUserStateSuccess({ userId, stateIndicators: data.stateIndicators }));
  } catch (err) {
    dispatch(updateUserStateError(err));
  }
};
