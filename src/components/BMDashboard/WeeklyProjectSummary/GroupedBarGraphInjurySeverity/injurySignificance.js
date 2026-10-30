// Exact conditional comparison of two Poisson rates. Under equal rates,
// B | (A+B) is Binomial(A+B, daysB/(daysA+daysB)). Two-sided probability
// ordering matches R's poisson.test/binom.test (including its tie tolerance).
// Reference: https://stat.ethz.ch/R-manual/R-devel/library/stats/html/poisson.test.html
const MAX_EVENTS = 1000000;
const ALPHA = 0.05;

export const exactRatePValue = (countA, countB, daysA, daysB) => {
  const total = countA + countB;
  if (
    ![countA, countB].every(count => Number.isSafeInteger(count) && count >= 0) ||
    ![daysA, daysB].every(days => Number.isFinite(days) && days > 0) ||
    !Number.isSafeInteger(total) ||
    total > MAX_EVENTS
  )
    return null;
  if (total === 0) return null;
  const p = daysB / (daysA + daysB);
  if (!(p > 0 && p < 1)) return null;
  const mode = Math.min(total, Math.floor((total + 1) * p));
  const down = k => (k / (total - k + 1)) * ((1 - p) / p);
  const up = k => ((total - k) / (k + 1)) * (p / (1 - p));
  // Scale all masses relative to the mode to avoid factorial overflow.
  let observedWeight = 1;
  for (let k = mode; k > countB && observedWeight > 0; k -= 1) observedWeight *= down(k);
  for (let k = mode; k < countB && observedWeight > 0; k += 1) observedWeight *= up(k);
  const threshold = observedWeight * (1 + 1e-7);
  let mass = 1;
  let extreme = 1 <= threshold ? 1 : 0;
  let weight = 1;
  for (let k = mode; k > 0 && weight > 0; k -= 1) {
    weight *= down(k);
    mass += weight;
    if (weight <= threshold) extreme += weight;
  }
  weight = 1;
  for (let k = mode; k < total && weight > 0; k += 1) {
    weight *= up(k);
    mass += weight;
    if (weight <= threshold) extreme += weight;
  }
  return Math.min(1, extreme / mass);
};

// Holm step-down adjustment controls family-wise error across the current
// category/severity combinations. Non-assessable combinations count as p=1.
// Reference: https://stat.ethz.ch/R-manual/R-devel/library/stats/html/p.adjust.html
export const holmAdjust = values => {
  const adjusted = Array(values.length).fill(null);
  const ordered = values
    .map((value, index) => ({ value: value ?? 1, index }))
    .sort((a, b) => a.value - b.value);
  let previous = 0;
  ordered.forEach(({ value, index }, rank) => {
    previous = Math.min(1, Math.max(previous, value * (values.length - rank)));
    if (values[index] !== null) adjusted[index] = previous;
  });
  return adjusted;
};

export const severitySignificance = (a, b) => {
  const pairs = new Map();
  [a, b].forEach((period, periodIndex) => {
    period.buckets.forEach(bucket =>
      bucket.records.forEach(record => {
        const workerCategory = String(record.workerCategory || '').trim() || 'Unknown';
        const severity = String(record.severity || '').trim() || 'Unknown';
        const key = JSON.stringify([workerCategory, severity]);
        if (!pairs.has(key))
          pairs.set(key, { workerCategory, severity, counts: [0, 0], invalid: false });
        const pair = pairs.get(key);
        if (!Number.isSafeInteger(record.count) || record.count < 0) pair.invalid = true;
        else pair.counts[periodIndex] += record.count;
      }),
    );
  });
  const rows = [...pairs.values()].map(({ workerCategory, severity, counts, invalid }) => {
    const [countA, countB] = counts;
    let reason = '';
    if (invalid) reason = 'Counts must be non-negative whole numbers.';
    else if (severity.trim().toLowerCase() === 'unknown') reason = 'Severity is not recorded.';
    else if (countA + countB === 0) reason = 'No recorded injuries in either period.';
    const pValue = reason ? null : exactRatePValue(countA, countB, a.days, b.days);
    if (pValue === null && !reason)
      reason = 'Counts or period lengths are outside the supported calculation range.';
    return {
      workerCategory,
      severity,
      countA: invalid ? null : countA,
      countB: invalid ? null : countB,
      rateA: invalid ? null : countA / a.days,
      rateB: invalid ? null : countB / b.days,
      pValue,
      reason,
    };
  });
  const adjusted = holmAdjust(rows.map(row => row.pValue));
  const results = rows.map((row, index) => {
    const adjustedPValue = adjusted[index];
    let status = 'not-assessed';
    if (adjustedPValue !== null) {
      status =
        adjustedPValue < ALPHA
          ? row.rateB > row.rateA
            ? 'increase'
            : 'decrease'
          : 'not-significant';
    }
    return { ...row, adjustedPValue, status };
  });
  const significant = results
    .filter(row => ['increase', 'decrease'].includes(row.status))
    .sort((left, right) => left.adjustedPValue - right.adjustedPValue);
  return {
    rows: results,
    significant,
    testedCount: results.filter(row => row.pValue !== null).length,
  };
};
