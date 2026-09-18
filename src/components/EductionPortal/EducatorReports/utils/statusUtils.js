// Shared status helpers for report tables.

const toNumber = value => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('%', '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const getStatusIcon = performance => {
  const p = toNumber(performance);
  if (p >= 85) return '🟢';
  if (p >= 70) return '🟡';
  if (p >= 50) return '🟠';
  return '🔴';
};

export const getStatusText = performance => {
  const p = toNumber(performance);
  if (p >= 85) return 'Excellent';
  if (p >= 70) return 'Good';
  if (p >= 50) return 'Needs Improvement';
  return 'Critical';
};

export const getStatusClass = performance => {
  const p = toNumber(performance);
  if (p >= 85) return 'excellent';
  if (p >= 70) return 'good';
  if (p >= 50) return 'needsImprovement';
  return 'critical';
};
