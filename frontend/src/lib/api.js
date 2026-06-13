const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.json();
}

export const api = {
  strategies: () => get('/strategies/'),
  strategy: (id) => get(`/strategies/${id}`),
  snapshots: (id) => get(`/strategies/${id}/snapshots`),
  bundles: () => get('/bundles/'),
  bundle: (id) => get(`/bundles/${id}`),
  leaderboard: (limit = 20) => get(`/leaderboard/?limit=${limit}`),
};
