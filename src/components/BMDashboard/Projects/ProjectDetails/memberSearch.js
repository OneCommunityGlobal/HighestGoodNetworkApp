export const MEMBER_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'firstName', label: 'First Name', suggest: true },
  { key: 'lastName', label: 'Last Name', suggest: true },
  { key: 'role', label: 'Role', suggest: true },
  { key: 'team', label: 'Team', suggest: true },
  { key: 'currentTask', label: 'Current Task' },
  { key: 'totalHrs', label: 'Total Hrs' },
  { key: 'todaysHrs', label: "Today's Hrs" },
];

export const EMPTY_FILTERS = Object.fromEntries(MEMBER_COLUMNS.map(({ key }) => [key, '']));
export const normalizeSearch = value =>
  String(value ?? '')
    .trim()
    .toLowerCase();

export function filterMembers(members, filters) {
  const active = MEMBER_COLUMNS.map(({ key }) => [key, normalizeSearch(filters[key])]).filter(
    ([, query]) => query,
  );
  return members.filter(member =>
    active.every(([key, query]) => normalizeSearch(member[key]).includes(query)),
  );
}

export function getMemberOptions(members, key) {
  const unique = new Map();
  members.forEach(member => {
    const text = String(member[key] ?? '').trim();
    const normalized = normalizeSearch(text);
    if (normalized && !unique.has(normalized)) unique.set(normalized, text);
  });
  return [...unique.values()].sort((a, b) => a.localeCompare(b));
}

// Literal string matching: punctuation must never become a regular expression or HTML.
export function highlightParts(value, query) {
  const text = String(value ?? '');
  const search = normalizeSearch(query);
  if (!search) return [{ text, match: false, key: 0 }];
  const parts = [];
  let offset = 0;
  let index = text.toLowerCase().indexOf(search, offset);
  while (index !== -1) {
    if (index > offset) parts.push({ text: text.slice(offset, index), match: false, key: offset });
    parts.push({ text: text.slice(index, index + search.length), match: true, key: index });
    offset = index + search.length;
    index = text.toLowerCase().indexOf(search, offset);
  }
  if (offset < text.length) parts.push({ text: text.slice(offset), match: false, key: offset });
  return parts;
}
