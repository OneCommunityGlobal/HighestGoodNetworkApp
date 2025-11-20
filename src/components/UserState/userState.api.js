import axios from "axios";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")) ||
  "http://localhost:4500";

const API = `${BASE_URL}/api/user-states`;

let catalogCache = null;
let userStateCache = {};
let batchLoaded = false;

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function authHeaders() {
  return {
    Authorization: `${getToken()}`,
  };
}

export async function fetchCatalog() {
  if (catalogCache) return catalogCache;
  const res = await axios.get(`${API}/catalog`, {
    headers: authHeaders(),
  });
  catalogCache = res.data.items || [];
  return catalogCache;
}

export async function fetchUserStatesBatch(userIds = []) {
  if (batchLoaded) return userStateCache;
  if (!Array.isArray(userIds) || userIds.length === 0) return {};

  const idString = userIds.join(",");
  const res = await axios.get(`${API}/users/state-indicators?ids=${idString}`, {
    headers: authHeaders(),
  });

  const map = res.data.selectionsByUserId || {};
  userStateCache = map;
  batchLoaded = true;

  return userStateCache;
}

export async function updateUserStates(userId, selectedKeys) {
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

  if (res.data?.selectionsByUserId?.[userId]) {
    userStateCache[userId] = res.data.selectionsByUserId[userId];
  }

  return res.data.selectionsByUserId?.[userId] || [];
}

export async function createNewState(label, color) {
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

  return res.data.item;
}
