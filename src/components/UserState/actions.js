// components/UserState/actions.js
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';

const API_BASE = process.env.REACT_APP_APIENDPOINT;

export const USERSTATE_CATALOG_SET = 'userstate/catalog/set';
export const USERSTATE_BULK_SET = 'userstate/bulk/set';
export const USERSTATE_SET_ONE = 'userstate/set/one';

let inFlight = new Set();

export const fetchUserStateCatalog = () => async (dispatch, getState) => {
  const have = getState().userState?.catalog;
  if (have && have.length) return; // cache
  const token = localStorage.getItem('token');
  const { data } = await axios.get(`${API_BASE}/user-states/catalog`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: token } : {}),
    },
  });
  const items = Array.isArray(data?.items) ? data.items : [];
  dispatch({ type: USERSTATE_CATALOG_SET, payload: items });
};

export const prefetchUserStatesFor = (userIds = []) => async (dispatch) => {
  // de-dupe and cap concurrency to avoid overload
  const ids = userIds.filter(Boolean).filter((id) => !inFlight.has(id));
  if (!ids.length) return;

  ids.forEach((id) => inFlight.add(id));
  const token = localStorage.getItem('token');

  // limit to 8 at a time
  const chunks = [];
  const size = 8;
  for (let i = 0; i < ids.length; i += size) chunks.push(ids.slice(i, i + size));

  for (const group of chunks) {
    const reqs = group.map((id) =>
      axios
        .get(`${API_BASE}/user-states/users/${id}/state-indicators`, {
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: token } : {}),
          },
        })
        .then((res) => ({ id, items: Array.isArray(res.data?.items) ? res.data.items : [] }))
        .catch(() => ({ id, items: [] })),
    );
    const results = await Promise.allSettled(reqs);
    const map = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled') {
        const { id, items } = r.value;
        map[id] = items.map((x) => (typeof x === 'string' ? x : x?.key)).filter(Boolean);
      } else {
        // keep undefined to avoid overwriting a possibly-cached value
      }
    });
    dispatch({ type: USERSTATE_BULK_SET, payload: map });
    group.forEach((id) => inFlight.delete(id));
  }
};

export const updateUserStateIndicators = (userId, nextKeys, userObj) => async (dispatch) => {
  const token = localStorage.getItem('token');
  // optimistic update
  dispatch({ type: USERSTATE_SET_ONE, payload: { userId, keys: nextKeys } });
  try {
    await axios.put(
      `${API_BASE}/user-states/users/${userId}/state-indicators`,
      { keys: nextKeys, user: userObj?._id || userId },
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: token } : {}),
        },
      },
    );
  } catch {
    // on failure you could re-fetch this user id
  }
};
