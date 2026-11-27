export const REPORT_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'sustainability', label: 'Sustainability Dashboard' },
  { id: 'preservation', label: 'Preservation Efficiency' },
  { id: 'forecast', label: 'Forecast Accuracy' },
];

export const DATE_RANGE_OPTIONS = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'thisYear', label: 'This Year' },
];

// Flip to true once the backend /kitchenandinventory/reports/export/* routes exist in HGNRest.
export const EXPORT_ENDPOINTS_READY = false;
