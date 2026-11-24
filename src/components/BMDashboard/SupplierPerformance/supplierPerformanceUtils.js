export const DEFAULT_SETTINGS = { target: 90, minimum: 75 };

// Accessible colors: green at/above target, amber in the warning band, red below minimum.
export const STATUS_COLORS = { above: '#16a34a', warning: '#f59e0b', below: '#dc2626' };

export const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last90', label: 'Last 3 months' },
  { value: 'lastYear', label: 'Last year' },
];

const round1 = value => Math.round(value * 10) / 10;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const pad = value => String(value).padStart(2, '0');

/** 'YYYY-MM-DD' in the browser's local time zone (not UTC). */
export function toLocalDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getDateRange(value, today = new Date()) {
  const endDate = toLocalDateString(today);
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  if (value === 'last30') return { startDate: toLocalDateString(new Date(y, m - 1, d)), endDate };
  if (value === 'last90') return { startDate: toLocalDateString(new Date(y, m - 3, d)), endDate };
  if (value === 'lastYear') return { startDate: toLocalDateString(new Date(y - 1, m, d)), endDate };
  return { startDate: '1970-01-01', endDate };
}

/** Keep target within 1–100 and the minimum between 0 and the target. */
export function normalizeSettings({ target, minimum } = {}) {
  const safeTarget = clamp(Number.isFinite(target) ? target : DEFAULT_SETTINGS.target, 1, 100);
  const safeMinimum = clamp(
    Number.isFinite(minimum) ? minimum : DEFAULT_SETTINGS.minimum,
    0,
    safeTarget,
  );
  return { target: safeTarget, minimum: safeMinimum };
}

export function classifySupplier(percentage, { target, minimum }) {
  if (percentage >= target) return 'above';
  if (percentage >= minimum) return 'warning';
  return 'below';
}

export function formatDifference(difference) {
  if (difference > 0) return `+${difference.toFixed(1)}% above target`;
  if (difference < 0) return `${difference.toFixed(1)}% below target`;
  return 'On target';
}

const DELIVERY_FIELDS = ['totalDeliveries', 'deliveries', 'totalOrders', 'deliveryCount'];

/** Number of deliveries if the API provides it, otherwise null. */
export function getDeliveries(row) {
  const field = DELIVERY_FIELDS.find(name => Number.isFinite(Number(row?.[name])));
  return field ? Number(row[field]) : null;
}

/** Add status, color and difference from target; drop invalid rows; best first. */
export function prepareSupplierRows(data, settings) {
  if (Array.isArray(data) === false) return [];
  return data
    .map(row => {
      const percentage = round1(Number(row?.onTimeDeliveryPercentage));
      const status = classifySupplier(percentage, settings);
      return {
        key: String(row?.supplierId ?? row?._id ?? row?.supplierName),
        supplierName: row?.supplierName || 'Unknown supplier',
        percentage,
        status,
        color: STATUS_COLORS[status],
        difference: round1(percentage - settings.target),
        deliveries: getDeliveries(row),
      };
    })
    .filter(row => Number.isFinite(row.percentage))
    .sort((a, b) => b.percentage - a.percentage);
}

/** Expects rows sorted best first (as returned by prepareSupplierRows). */
export function summarizeSuppliers(rows, { target }) {
  const aboveTarget = rows.filter(row => row.percentage >= target).length;
  return {
    total: rows.length,
    aboveTarget,
    belowTarget: rows.length - aboveTarget,
    best: rows[0] || null,
    worst: rows.length ? rows[rows.length - 1] : null,
  };
}

/** Project list entries may be strings or objects with different id/name fields. */
export function toProjectOption(project) {
  if (typeof project === 'string') return { value: project, label: project };
  const value = project?._id ?? project?.projectId ?? project?.id ?? project?.value;
  if (value === undefined || value === null) return null;
  const label = project?.name ?? project?.projectName ?? project?.label ?? String(value);
  return { value: String(value), label };
}
