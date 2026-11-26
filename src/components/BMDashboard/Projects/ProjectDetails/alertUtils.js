// Shared logic for the "Rented Tools or Equipment" and "Materials with
// Quantity < 20%" alert sections on the BM project details page.

export const DAY_MS = 24 * 60 * 60 * 1000;
export const LOW_STOCK_THRESHOLD = 20; // percent of stock bought still available

export const RISK_LEVELS = ['critical', 'warning', 'normal'];
export const RISK_LABELS = { critical: 'Critical', warning: 'Warning', normal: 'Normal' };
const RISK_RANK = { critical: 0, warning: 1, normal: 2 };

const RENTAL_STATUSES = ['Rental', 'Rented'];

const idOf = value => (value && typeof value === 'object' ? value._id : value);
const sameId = (a, b) => a != null && b != null && String(idOf(a)) === String(idOf(b));
const fullName = user =>
  user && typeof user === 'object'
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || null
    : null;
const lastOf = list => (Array.isArray(list) && list.length ? list[list.length - 1] : null);

// Rentals: overdue or due within a day is critical, within 3 days is warning.
export function getRentalRisk(dueDate, now = Date.now()) {
  const due = new Date(dueDate).getTime();
  if (Number.isNaN(due)) return { daysLeft: null, level: 'normal' };
  const daysLeft = Math.ceil((due - now) / DAY_MS);
  if (daysLeft <= 1) return { daysLeft, level: 'critical' };
  if (daysLeft <= 3) return { daysLeft, level: 'warning' };
  return { daysLeft, level: 'normal' };
}

export function formatDueIn(daysLeft) {
  if (daysLeft == null) return 'No due date';
  if (daysLeft < 0) {
    const late = Math.abs(daysLeft);
    return `Overdue by ${late} day${late === 1 ? '' : 's'}`;
  }
  if (daysLeft === 0) return 'Due today';
  return `Due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
}

// Materials: under 10% left is critical, under 20% is warning.
export function getStockRisk(available, bought) {
  const total = Number(bought);
  if (!total || total <= 0) return { percentLeft: null, level: 'normal' };
  const percentLeft = Math.max(0, (Number(available) / total) * 100);
  if (percentLeft < 10) return { percentLeft, level: 'critical' };
  if (percentLeft < LOW_STOCK_THRESHOLD) return { percentLeft, level: 'warning' };
  return { percentLeft, level: 'normal' };
}

// Latest check-in/out record says who has the item.
const responsibleFrom = item =>
  fullName(lastOf(item?.logRecord)?.responsibleUser) || fullName(item?.userResponsible);

export function buildRentalItems({ tools = [], equipments = [], projectId, now = Date.now() }) {
  const normalize = (item, kind) => {
    const { daysLeft, level } = getRentalRisk(item.rentalDueDate, now);
    const lastPurchase = lastOf(item.purchaseRecord);
    return {
      id: String(item._id),
      kind,
      name: item.itemType?.name || (kind === 'tool' ? 'Unnamed tool' : 'Unnamed equipment'),
      category: item.itemType?.category || (kind === 'tool' ? 'Tool' : 'Equipment'),
      vendor: lastPurchase?.makeModelPref || lastPurchase?.brand || null,
      imageUrl: item.imageUrl || item.itemType?.imageUrl || null,
      rentedOnDate: item.rentedOnDate || null,
      dueDate: item.rentalDueDate,
      daysLeft,
      level,
      responsible: responsibleFrom(item),
      detailPath:
        kind === 'tool' ? `/bmdashboard/tools/${item._id}` : `/bmdashboard/equipment/${item._id}`,
    };
  };

  const isActiveRental = item =>
    item &&
    sameId(item.project, projectId) &&
    RENTAL_STATUSES.includes(item.purchaseStatus) &&
    item.rentalDueDate;

  return [
    ...(Array.isArray(tools) ? tools : []).filter(isActiveRental).map(t => normalize(t, 'tool')),
    ...(Array.isArray(equipments) ? equipments : [])
      .filter(isActiveRental)
      .map(e => normalize(e, 'equipment')),
  ];
}

export function buildLowStockItems({ materials = [], projectId }) {
  return (Array.isArray(materials) ? materials : [])
    .filter(m => m && sameId(m.project, projectId))
    .map(m => {
      const { percentLeft, level } = getStockRisk(m.stockAvailable, m.stockBought);
      const lastPurchase = lastOf(m.purchaseRecord);
      return {
        id: String(m._id),
        name: m.itemType?.name || 'Unnamed material',
        unit: m.itemType?.unit || '',
        category: 'Material',
        vendor: lastPurchase?.brandPref || lastPurchase?.brand || null,
        available: m.stockAvailable ?? 0,
        bought: m.stockBought ?? 0,
        percentLeft,
        level,
        raw: m,
      };
    })
    .filter(item => item.percentLeft != null && item.percentLeft < LOW_STOCK_THRESHOLD);
}

const byText = key => (a, b) =>
  String(a[key] ?? '￿').localeCompare(String(b[key] ?? '￿'), undefined, {
    sensitivity: 'base',
  });

const byUrgency = (a, b) => {
  const rank = RISK_RANK[a.level] - RISK_RANK[b.level];
  if (rank !== 0) return rank;
  // Within a level: sooner due date or lower % left first.
  const aValue = a.daysLeft ?? a.percentLeft ?? Infinity;
  const bValue = b.daysLeft ?? b.percentLeft ?? Infinity;
  return aValue - bValue;
};

export const SORT_OPTIONS = [
  { value: 'urgency', label: 'Urgency' },
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'vendor', label: 'Vendor / brand' },
];

export function sortAndFilterItems(items, { sortBy = 'urgency', level = 'all' } = {}) {
  const filtered = level === 'all' ? [...items] : items.filter(item => item.level === level);
  const compare = sortBy === 'urgency' ? byUrgency : byText(sortBy);
  // Ties fall back to urgency so the most pressing items stay on top.
  return filtered.sort((a, b) => compare(a, b) || byUrgency(a, b));
}

// Sort/filter choices last for the browser session, per section.
export function readSessionPrefs(key, fallback) {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(key));
    return saved && typeof saved === 'object' ? { ...fallback, ...saved } : fallback;
  } catch {
    return fallback;
  }
}

export function writeSessionPrefs(key, prefs) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    // Storage can be unavailable (private mode, quota); sorting still works in memory.
  }
}
