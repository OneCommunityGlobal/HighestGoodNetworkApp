// v1.0.0
export const METRICS = [
  { key: 'cost', label: 'Cost variance', medium: 5, high: 15, weight: 0.4 },
  { key: 'delay', label: 'Time delay', medium: 5, high: 15, weight: 0.4 },
  { key: 'issues', label: 'Open issues', medium: 3, high: 10, weight: 0.2 },
];

const numberOrNull = value => (typeof value === 'number' && Number.isFinite(value) ? value : null);

export function normalizeMetrics(snapshot) {
  const elapsed = numberOrNull(snapshot.predictedTimeDelay);
  const issues = numberOrNull(snapshot.totalOpenIssues);
  return {
    cost: numberOrNull(snapshot.predictedCostOverrun),
    // The summary API returns elapsed/planned * 100, so 100 means no delay.
    delay: elapsed === null || elapsed < 0 ? null : Math.max(0, elapsed - 100),
    issues: issues !== null && Number.isInteger(issues) && issues >= 0 ? issues : null,
  };
}

export function riskLevel(value, medium = 30, high = 60) {
  if (value === null) return 'Unknown';
  if (value >= high) return 'High';
  if (value >= medium) return 'Medium';
  return 'Low';
}

export function assessRisk(values) {
  const contributions = METRICS.map(metric => ({
    ...metric,
    points:
      values[metric.key] === null
        ? null
        : Math.min(100, (Math.max(0, values[metric.key]) / metric.high) * 100) * metric.weight,
  }));
  const incomplete = contributions.some(metric => metric.points === null);
  const score = incomplete ? null : Math.round(contributions.reduce((sum, m) => sum + m.points, 0));
  const level = riskLevel(score);
  const driver = [...contributions].sort((a, b) => (b.points || 0) - (a.points || 0))[0];
  const severe = METRICS.filter(
    metric => riskLevel(values[metric.key], metric.medium, metric.high) === 'High',
  );
  let action = 'Monitor at the next project review.';
  if (level === 'Medium') action = 'Review the main risk driver with the project owner.';
  if (level === 'High' || severe.length)
    action = 'Escalate to the project lead and agree a mitigation plan.';
  if (incomplete) {
    action = `Verify missing metrics with the project owner.${
      severe.length ? ' Escalate the known High risk metrics to the project lead.' : ''
    }`;
  }
  return {
    score,
    level,
    action,
    explanation: incomplete
      ? 'Overall risk unavailable: one or more metrics are missing.'
      : contributions.every(metric => metric.points === 0)
      ? 'No positive cost variance, delay, or open issues reported.'
      : `${driver.label} contributes most to the weighted score.${
          severe.length
            ? ` High threshold reached: ${severe.map(m => m.label.toLowerCase()).join(', ')}.`
            : ''
        }`,
  };
}

export function formatMetric(key, value) {
  if (value === null) return 'Unavailable';
  if (key === 'issues') return String(value);
  const amount = Number(Math.abs(value).toFixed(2));
  if (key === 'cost') {
    if (value < 0) return `${amount}% under budget`;
    if (value > 0) return `${amount}% over budget`;
    return 'On budget (0%)';
  }
  return value === 0 ? 'No delay (0%)' : `${amount}% delay`;
}

export function comparisonText(current, previous) {
  if (!previous) return 'Change vs previous period: unavailable (no recorded history).';
  return `Change vs previous period: ${METRICS.map(({ key, label }) => {
    if (current[key] === null || previous[key] === null) return `${label}: unavailable`;
    const delta = Number((current[key] - previous[key]).toFixed(2));
    return `${label}: ${delta > 0 ? '+' : ''}${delta}${key === 'issues' ? '' : ' pp'}`;
  }).join('; ')}.`;
}

export function buildRiskRows(projects, start, end) {
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  const previousStart = new Date(Date.parse(start) - days * 86400000).toISOString().slice(0, 10);
  return projects
    .map((project, index) => {
      const history = (Array.isArray(project.history) ? project.history : [])
        .filter(h => h && typeof h.date === 'string' && Number.isFinite(Date.parse(h.date)))
        .map(h => ({ ...normalizeMetrics(h), date: new Date(h.date).toISOString().slice(0, 10) }))
        .sort((a, b) => a.date.localeCompare(b.date));
      const selected = history.filter(h => h.date >= start && h.date <= end);
      const previous = history.filter(h => h.date >= previousStart && h.date < start).slice(-1)[0];
      // Snapshot-only responses have no historical dates; never invent observations.
      const current = history.length ? selected.slice(-1)[0] : normalizeMetrics(project);
      if (!current) return null;
      return {
        ...current,
        id: String(project.projectId || project._id || index),
        projectName: project.projectName || project.name || 'Unknown project',
        history: selected,
        snapshotOnly: history.length === 0,
        comparison: comparisonText(current, previous),
        ...assessRisk(current),
      };
    })
    .filter(Boolean);
}
