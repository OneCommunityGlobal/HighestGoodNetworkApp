export const isValidBadgeCount = value =>
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) >= 0;

const hasId = value => typeof value === 'string' && value.trim().length > 0;

export const isEditableBadgeRecord = record =>
  Boolean(
    record &&
      hasId(record._id) &&
      record.badge &&
      typeof record.badge === 'object' &&
      hasId(record.badge._id) &&
      isValidBadgeCount(record.count),
  );

const rankOf = record => {
  const rank = record.badge?.ranking;
  return Number.isSafeInteger(rank) && rank > 0 ? rank : Infinity;
};

export const compareBadgeRecords = (a, b) => {
  const rankA = rankOf(a);
  const rankB = rankOf(b);
  if (rankA !== rankB) return rankA < rankB ? -1 : 1;
  return String(a.badge?.badgeName ?? '').localeCompare(String(b.badge?.badgeName ?? ''));
};

export const sortBadgeRecords = collection =>
  (Array.isArray(collection) ? collection : [])
    .filter(isEditableBadgeRecord)
    .sort(compareBadgeRecords);

export const inspectBadgeCollection = collection => {
  const records = Array.isArray(collection) ? collection : [];
  const ids = records.map(record => record?._id);
  return {
    records: sortBadgeRecords(records.filter(isEditableBadgeRecord)),
    hasInvalidRecords:
      (collection != null && !Array.isArray(collection)) ||
      records.some(record => !isEditableBadgeRecord(record)) ||
      new Set(ids).size !== ids.length,
  };
};
