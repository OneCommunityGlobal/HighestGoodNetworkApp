import axios from "axios";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")) ||
  "http://localhost:4500";

const API = `${BASE_URL}/api/user-states`;

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: token } : {};
}

let catalogCache = null;
let userStateCache = {};
let catalogCacheTime = 0;
const CATALOG_TTL = 5 * 60 * 1000; // 5 min TTL
let batchLoaded = false;

export async function fetchCatalog(forceReload = false) {
  const now = Date.now();
  if (
    !forceReload &&
    catalogCache &&
    now - catalogCacheTime < CATALOG_TTL
  ) {
    return catalogCache;
  }

  try {
    const res = await axios.get(`${API}/catalog`, {
      headers: authHeaders(),
    });
    catalogCache = res.data.items || [];
    catalogCacheTime = now;
    return catalogCache;
  } catch (e) {
    console.error("fetchCatalog error:", e.message);
    return [];
  }
}

export async function createNewState(label, color) {
  try {
    const res = await axios.post(
      `${API}/catalog`,
      { label, color },
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
      }
    );
    catalogCache = null;
    catalogCacheTime = 0;

    return res.data.item;
  } catch (e) {
    console.error("createNewState error:", e.message);
    throw e;
  }
}

export async function fetchUserStatesBatch(userIds = []) {
  if (batchLoaded && userStateCache) return userStateCache;
  if (!Array.isArray(userIds) || userIds.length === 0) return {};

  try {
    const idString = userIds.join(",");
    const res = await axios.get(`${API}/users/state-indicators?ids=${idString}`, {
      headers: authHeaders(),
    });

    const map = res.data.selectionsByUserId || {};
    userStateCache = map;
    batchLoaded = true;

    return userStateCache;
  } catch (e) {
    console.error("fetchUserStatesBatch error:", e.message);
    return {};
  }
}

export async function updateUserStates(userId, selectedKeys) {
  try {
    const body = {
      updates: [
        {
          userId,
          selectedKeys,
        },
      ],
    };

    const res = await axios.patch(`${API}/users/state-indicators`, body, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    });

    const updated =
      res.data?.selectionsByUserId?.[userId] || [];
    userStateCache[userId] = updated;
    return updated;
  } catch (e) {
    console.error("updateUserStates error:", e.message);
    throw e;
  }
}

export async function fetchSingleUserState(userId) {
  try {
    const res = await axios.get(`${API}/users/${userId}/state-indicators`, {
      headers: authHeaders(),
    });

    const selections = res.data?.selectionsByUserId?.[userId] || [];
    userStateCache[userId] = selections;

    return selections;
  } catch (e) {
    console.error("fetchSingleUserState error:", e.message);
    return [];
  }
}

export function clearUserStateCache() {
  userStateCache = {};
  batchLoaded = false;
}

export function clearCatalogCache() {
  catalogCache = null;
  catalogCacheTime = 0;
}
