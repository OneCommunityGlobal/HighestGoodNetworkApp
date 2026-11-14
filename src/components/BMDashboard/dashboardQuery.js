// These parameters control only the project summaries and Project Status chart, respectively.
export const PROJECT_PARAM = 'bmProject';
export const STATUS_START_PARAM = 'statusStartDate';
export const STATUS_END_PARAM = 'statusEndDate';

export function updateDashboardQuery(history, updates) {
  const { pathname, search, hash, state } = history.location;
  const params = new URLSearchParams(search);
  Object.entries(updates).forEach(([key, values]) => {
    params.delete(key);
    values.forEach(value => params.append(key, value));
  });
  const nextSearch = params.toString();
  const next = nextSearch ? `?${nextSearch}` : '';
  if (next !== search) history.push({ pathname, search: next, hash, state });
}

export function readProjectIds(search) {
  return [...new Set(new URLSearchParams(search).getAll(PROJECT_PARAM).filter(Boolean))];
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1];
}

export function readStatusDates(search) {
  const params = new URLSearchParams(search);
  const starts = params.getAll(STATUS_START_PARAM);
  const ends = params.getAll(STATUS_END_PARAM);
  if (
    starts.length > 1 ||
    ends.length > 1 ||
    (starts.length === 1 && !validDate(starts[0])) ||
    (ends.length === 1 && !validDate(ends[0]))
  ) {
    return { start: '', end: '' };
  }
  const start = starts.length === 1 && validDate(starts[0]) ? starts[0] : '';
  const end = ends.length === 1 && validDate(ends[0]) ? ends[0] : '';
  if (start && end && start > end) return { start: '', end: '' };
  return { start, end };
}
