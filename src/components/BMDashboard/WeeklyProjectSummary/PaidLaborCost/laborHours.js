const nonNegative = value =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

export const getEntryLaborHours = entry => {
  let hours = nonNegative(entry.hoursWorked);
  let rate = nonNegative(entry.hourlyRate);
  let calculated = entry.hoursSource === 'calculated' || entry.rateSource === 'calculated';
  if (hours === null && rate > 0) {
    hours = entry.cost / rate;
    calculated = true;
  }
  if (rate === null && hours > 0) {
    rate = entry.cost / hours;
    calculated = true;
  }
  return { hours, rate, calculated };
};

export const summarizeLaborHours = entries => {
  let hours = 0;
  let complete = true;
  let calculated = false;
  let known = 0;
  const rates = new Set();
  entries.forEach(entry => {
    const details = getEntryLaborHours(entry);
    if (details.hours === null) {
      complete = false;
    } else {
      hours += details.hours;
      known += 1;
    }
    if (details.rate !== null) rates.add(details.rate);
    calculated ||= details.calculated;
  });
  const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
  const rate = complete && hours > 0 ? totalCost / hours : null;
  return {
    hoursWorked: complete && known > 0 ? hours : null,
    knownHours: hours,
    hourlyRate: rate,
    hoursStatus: complete && known > 0 ? 'complete' : known > 0 ? 'incomplete' : 'unavailable',
    rateLabel: rates.size > 1 ? 'Average hourly rate' : 'Hourly rate',
    calculated,
  };
};

export const formatHours = details => {
  if (details?.hoursStatus === 'incomplete') {
    return `${details.knownHours.toLocaleString('en-US', { maximumFractionDigits: 2 })} (partial)`;
  }
  if (details?.hoursWorked === null || details?.hoursWorked === undefined) return 'Unavailable';
  return details.hoursWorked.toLocaleString('en-US', { maximumFractionDigits: 2 });
};
