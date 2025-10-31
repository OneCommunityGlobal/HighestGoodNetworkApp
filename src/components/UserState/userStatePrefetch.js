import axios from 'axios';

export async function preloadUserStates({ apiBase = '/api', token = '', userIds = [], concurrency = 8 }) {
  const base = `${apiBase}/user-states`;
  const api = axios.create({
    baseURL: base,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: token } : {}) },
  });

  const result = { catalog: [], selections: new Map() };

  const catalogRes = await api.get('/catalog').then(r => r?.data?.items || []).catch(() => []);
  result.catalog = Array.isArray(catalogRes) ? catalogRes : [];

  const queue = [...new Set(userIds)].filter(Boolean);
  let idx = 0;
  async function worker() {
    while (idx < queue.length) {
      const i = idx++;
      const uid = queue[i];
      try {
        const r = await api.get(`/users/${uid}/state-indicators`);
        const sels = Array.isArray(r?.data?.selections)
          ? r.data.selections
          : (r?.data?.stateIndicators || []).map(k => ({ key: k }));
        result.selections.set(uid, sels);
      } catch {
        result.selections.set(uid, []);
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, worker);
  await Promise.all(workers);

  return result;
}
