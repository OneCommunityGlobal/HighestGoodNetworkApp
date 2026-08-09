export const toNum = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const formatPercentage = (value) => `${toNum(value)}%`;

export const formatInteger = (value) => toNum(value).toLocaleString();

export const aggregateJobsByTitle = (data = []) => {
  const jobsByTitle = new Map();

  data.forEach((item) => {
    const title = item.title;
    const hits = toNum(item.hits);
    const applications = toNum(item.applications);

    const existing = jobsByTitle.get(title);

    if (!existing) {
      jobsByTitle.set(title, {
        ...item,
        hits,
        applications,
      });
      return;
    }

    jobsByTitle.set(title, {
      ...existing,
      hits: existing.hits + hits,
      applications: existing.applications + applications,
    });
  });

  return Array.from(jobsByTitle.values()).map((job) => ({
    ...job,
    conversionRate: job.hits
      ? Number(((job.applications / job.hits) * 100).toFixed(2))
      : 0,
  }));
};

export const sortJobsByMetric = (
  jobs,
  metricKey,
  direction = 'descending',
) => {
  const multiplier = direction === 'ascending' ? 1 : -1;

  return [...jobs].sort((a, b) => {
    const metricDifference =
      toNum(a[metricKey]) - toNum(b[metricKey]);

    if (metricDifference !== 0) {
      return metricDifference * multiplier;
    }

    return (
      (toNum(a.conversionRate) - toNum(b.conversionRate)) *
      multiplier
    );
  });
};

export const getChartMaxValue = (rows, metricKey) => {
  if (!rows.length) return 1;

  const maxValue = Math.max(
    ...rows.map((row) => toNum(row[metricKey])),
  );

  return Math.max(1, Math.ceil(maxValue * 1.05));
};