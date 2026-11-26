// Helpers for the Injury Severity by Category chart.
// Projects are identified by normalized name: legacy injury rows reuse one projectId across
// different project names, and one name can span several projectIds.

export const UNKNOWN_PROJECT_KEY = '__unknown__';

// Categorical palettes validated (CVD + normal-vision separation) against each chart surface,
// in fixed order so adjacent bars stay distinguishable.
export const INJURY_SERIES_COLORS = {
  light: [
    '#2a78d6',
    '#eb6834',
    '#1baf7a',
    '#eda100',
    '#e87ba4',
    '#008300',
    '#6250d6',
    '#e34948',
    '#0095b6',
    '#a86400',
  ],
  dark: [
    '#3987e5',
    '#d95926',
    '#199e70',
    '#c98500',
    '#d55181',
    '#008300',
    '#9085e9',
    '#e66767',
    '#0f9ab8',
    '#b8720a',
  ],
};

export const projectNameKey = name =>
  String(name ?? '')
    .trim()
    .toLowerCase();

// One dropdown option per project name.
export function buildProjectOptions(projects = []) {
  const byKey = new Map();
  for (const p of projects) {
    const label = String(p?.name ?? '').trim();
    const key = projectNameKey(label);
    if (key && !byKey.has(key)) byKey.set(key, { value: key, label });
  }
  return Array.from(byKey.values()).sort((a, b) => a.label.localeCompare(b.label));
}

// projectId -> set of name keys that use it.
export function buildIdToKeys(projects = []) {
  const map = new Map();
  for (const p of projects) {
    const key = projectNameKey(p?.name);
    if (!key) continue;
    const ids = Array.isArray(p?.projectIds) && p.projectIds.length ? p.projectIds : [p?._id];
    for (const id of ids) {
      const sid = String(id ?? '');
      if (!sid) continue;
      if (!map.has(sid)) map.set(sid, new Set());
      map.get(sid).add(key);
    }
  }
  return map;
}

// Rows without a name fall back to their projectId only when that ID belongs to one project.
export function resolveRowKey(row, idToKeys) {
  const key = projectNameKey(row?.projectName);
  if (key) return key;
  const keys = idToKeys.get(String(row?.projectId ?? ''));
  return keys?.size === 1 ? keys.values().next().value : UNKNOWN_PROJECT_KEY;
}

// Assign each project key a Recharts-safe dataKey and a color, sorted by key so colors
// don't depend on API order or active filters. Unknown sorts last so it never shifts real projects.
export function buildSeriesMeta(keys, palette) {
  const meta = new Map();
  Array.from(new Set(keys))
    .sort((a, b) => {
      if (a === UNKNOWN_PROJECT_KEY) return 1;
      if (b === UNKNOWN_PROJECT_KEY) return -1;
      return a.localeCompare(b);
    })
    .forEach((key, index) => {
      meta.set(key, { dataKey: `s${index}`, color: palette[index % palette.length] });
    });
  return meta;
}

// Sum injuries per worker category and project.
export function buildChartData(rows, resolveKey, seriesMeta) {
  const acc = Object.create(null);
  for (const r of rows) {
    const workerCategory = r?.workerCategory ?? 'Unknown';
    const dataKey = seriesMeta.get(resolveKey(r))?.dataKey;
    if (!dataKey) continue;
    if (!acc[workerCategory]) acc[workerCategory] = { workerCategory };
    acc[workerCategory][dataKey] =
      (acc[workerCategory][dataKey] || 0) + (Number(r?.totalInjuries) || 0);
  }
  return Object.values(acc);
}
