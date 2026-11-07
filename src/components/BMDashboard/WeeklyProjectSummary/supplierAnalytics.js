// Equal weight per historical observation: delivery counts are unavailable.
export const supplierKey = r => (r.supplierId ? `id:${r.supplierId}` : `name:${r.supplierName}`);
export const periodKey = (date, period) => {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  if (period === 'yearly') return `${year}`;
  if (period === 'quarterly') return `${year}-Q${Math.floor(d.getUTCMonth() / 3) + 1}`;
  return `${year}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};
const mean = values => values.reduce((a, b) => a + b, 0) / values.length;
const round = n => Math.round(n * 100) / 100;
export function analyzeSuppliers(records, causes, period, benchmark) {
  const groups = new Map();
  records.forEach(r => {
    if (
      !Number.isFinite(r.onTimeDeliveryPercentage) ||
      r.onTimeDeliveryPercentage < 0 ||
      r.onTimeDeliveryPercentage > 100 ||
      !Number.isFinite(+new Date(r.endDate))
    )
      return;
    const key = supplierKey(r);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });
  return [...groups]
    .map(([key, rows]) => {
      const buckets = new Map();
      rows.forEach(r => {
        const bucket = periodKey(r.endDate, period);
        if (!buckets.has(bucket)) buckets.set(bucket, []);
        buckets.get(bucket).push(r.onTimeDeliveryPercentage);
      });
      const history = [...buckets]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([label, values]) => ({ label, value: round(mean(values)), count: values.length }));
      const values = history.map(h => h.value);
      const average = mean(rows.map(r => r.onTimeDeliveryPercentage));
      const variability = Math.sqrt(mean(values.map(v => (v - mean(values)) ** 2)));
      const changes = values.slice(1).map((v, i) => Math.abs(v - values[i]));
      const deficits = rows.map(r =>
        Math.max(0, (r.slaTarget ?? benchmark) - r.onTimeDeliveryPercentage),
      );
      const frequency = deficits.filter(d => d > 0).length / rows.length;
      const risk =
        values.length < 3
          ? null
          : round(
              Math.min(
                100,
                0.25 * Math.min(100, variability * 2) +
                  0.25 * mean(changes) +
                  0.3 * frequency * 100 +
                  0.2 * mean(deficits),
              ),
            );
      const delta = values[values.length - 1] - values[0];
      return {
        key,
        supplierName: rows[0].supplierName,
        average: round(average),
        history,
        observations: rows.length,
        variability: round(variability),
        risk,
        riskLevel:
          risk == null ? 'Insufficient history' : risk < 30 ? 'Low' : risk < 60 ? 'Medium' : 'High',
        trend:
          values.length < 2
            ? 'Insufficient history'
            : Math.abs(delta) < 2
            ? 'Stable'
            : delta > 0
            ? 'Improving'
            : 'Declining',
        delta: values.length < 2 ? null : round(delta),
        benchmarkRecords: rows.filter(r => r.slaTarget == null).length,
        belowTarget: deficits.some(d => d > 0),
        tags: causes.find(c => c.supplierKey === key)?.tags || [],
      };
    })
    .sort((a, b) => b.average - a.average || a.key.localeCompare(b.key));
}
export const rankSuppliers = (suppliers, ranking) => {
  if (ranking === 'top') return suppliers.slice(0, 5);
  if (ranking === 'bottom') return [...suppliers].reverse().slice(0, 5);
  return suppliers;
};
export function comparisonRows(suppliers) {
  const labels = [...new Set(suppliers.flatMap(s => s.history.map(h => h.label)))].sort();
  if (labels.length > 1) {
    const quarterly = labels[0].includes('Q');
    const yearly = labels[0].length === 4;
    const asIndex = label => {
      const year = Number(label.slice(0, 4));
      if (yearly) return year;
      return year * (quarterly ? 4 : 12) + Number(label.slice(quarterly ? 6 : 5)) - 1;
    };
    const first = asIndex(labels[0]);
    const last = asIndex(labels[labels.length - 1]);
    const divisor = quarterly ? 4 : 12;
    const filled = Array.from({ length: last - first + 1 }, (_, i) => {
      const index = first + i;
      if (yearly) return String(index);
      return `${Math.floor(index / divisor)}-${quarterly ? 'Q' : ''}${
        quarterly ? (index % divisor) + 1 : String((index % divisor) + 1).padStart(2, '0')
      }`;
    });
    labels.splice(0, labels.length, ...filled);
  }
  return labels.map(label =>
    Object.fromEntries([
      ['label', label],
      ...suppliers.map(s => [s.key, s.history.find(h => h.label === label)?.value ?? null]),
    ]),
  );
}
export function reportRows(suppliers, context) {
  return suppliers.flatMap(s =>
    s.history.map(h => [
      context,
      s.supplierName,
      s.key,
      h.label,
      h.value,
      h.count,
      s.average,
      s.trend,
      s.delta ?? '',
      s.risk ?? '',
      s.riskLevel,
      s.benchmarkRecords,
      s.tags.join('; '),
    ]),
  );
}
export const reportHeaders = [
  'Report filters',
  'Supplier',
  'Supplier key',
  'Period',
  'On time %',
  'Observations',
  'Overall %',
  'Trend',
  'Change (pp)',
  'Risk score',
  'Risk level',
  'Benchmark records',
  'Root causes',
];
export const toCSV = rows =>
  rows
    .map(row =>
      row
        .map(value => {
          const text = String(value ?? '');
          const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
          return `"${safe.replace(/"/g, '""')}"`;
        })
        .join(','),
    )
    .join('\r\n');
