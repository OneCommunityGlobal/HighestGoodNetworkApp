const formatCost = value =>
  `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const getCostPercentage = (cost, total) => {
  if (!Number.isFinite(cost) || !Number.isFinite(total) || total <= 0) return 0;
  return (cost / total) * 100;
};

export const buildLaborCostTooltip = (context, totalCost, totalBudget) => {
  const project = context.chart.data.labels[context.dataIndex];
  const rawCost = context.parsed.y;
  const cost = Number.isFinite(rawCost) ? rawCost : 0;
  const isBudget = context.dataset.costType === 'budget';
  const total = isBudget ? totalBudget : totalCost;
  const totalLabel = isBudget ? 'budget' : 'actual labor cost';
  const lines = [`${project}, ${context.dataset.label}: ${formatCost(cost)}`];

  if (!Number.isFinite(total) || total <= 0) {
    lines.push(`Share unavailable: filtered ${totalLabel} total is zero or unavailable.`);
    return lines;
  }

  const percentage = getCostPercentage(cost, total);
  const share = percentage > 0 && percentage < 0.1 ? '<0.1' : percentage.toFixed(1);
  lines.push(`${share}% of filtered ${totalLabel}`);
  lines.push(`Filtered total: ${formatCost(total)}`);
  return lines;
};
