export const analysisSeries = buckets => {
  const categories = [
    ...new Set(buckets.flatMap(bucket => bucket.records.map(record => record.workerCategory))),
  ].sort();
  const series = categories.map((name, index) => ({ name, key: `category${index}` }));
  const rows = buckets.map(bucket => {
    const row = { label: bucket.label, records: bucket.records };
    series.forEach(({ name, key }) => {
      row[key] = bucket.records
        .filter(record => record.workerCategory === name)
        .reduce((sum, record) => sum + record.count, 0);
    });
    return row;
  });
  return { series, rows };
};

export const comparePeriods = (a, b) => {
  const totals = period => {
    const result = new Map();
    period.buckets.forEach(bucket =>
      bucket.records.forEach(record => {
        result.set(record.workerCategory, (result.get(record.workerCategory) || 0) + record.count);
      }),
    );
    return result;
  };
  const first = totals(a);
  const second = totals(b);
  return [...new Set([...first.keys(), ...second.keys()])].sort().map(category => {
    const countA = first.get(category) || 0;
    const countB = second.get(category) || 0;
    const change = countB - countA;
    let description = '→ Unchanged';
    if (change !== 0) {
      const direction = change > 0 ? '↑' : '↓';
      const amount = `${Math.abs(change)} ${change > 0 ? 'more' : 'fewer'}`;
      const percentage = countA
        ? `${Math.abs((change / countA) * 100).toFixed(1)}%`
        : 'new injuries';
      description = `${direction} ${amount} (${percentage})`;
    }
    return {
      category,
      countA,
      countB,
      change,
      description,
      rateA: countA / a.days,
      rateB: countB / b.days,
    };
  });
};

export const defaultRange = () => {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  const ymd = date =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  return { start: ymd(start), end: ymd(end) };
};

export const previousRange = (start, end) => {
  const first = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  const days = Math.round((last - first) / 86400000) + 1;
  if (!Number.isFinite(days) || days < 1) return { start, end };
  return {
    start: new Date(first.getTime() - days * 86400000).toISOString().slice(0, 10),
    end: new Date(first.getTime() - 86400000).toISOString().slice(0, 10),
  };
};
