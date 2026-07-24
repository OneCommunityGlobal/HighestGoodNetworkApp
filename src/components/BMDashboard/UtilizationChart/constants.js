export const FORECAST_MODES = {
  HISTORICAL: 'historical',
  FORECAST_30: 'forecast30',
  FORECAST_FULL: 'forecastFull',
};

export const FORECAST_MODE_LABELS = {
  [FORECAST_MODES.HISTORICAL]: 'Historical View',
  [FORECAST_MODES.FORECAST_30]: 'Next 30 Days',
  [FORECAST_MODES.FORECAST_FULL]: 'Full Project Schedule',
};

export const TRAFFIC_LIGHT_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

export const TRAFFIC_LIGHT_LABELS = {
  green: 'Normal',
  yellow: 'Under-utilized',
  red: 'Over-utilized',
};

export const CLASSIFICATION_LABELS = {
  UNDER: 'Under-utilized',
  NORMAL: 'Normal',
  OVER: 'Over-utilized',
};

export const URGENCY_STYLES = {
  high: { color: '#ef4444', label: 'HIGH' },
  medium: { color: '#f59e0b', label: 'MEDIUM' },
};

export const CONFIDENCE_STYLES = {
  low: { color: '#ef4444', label: 'Low confidence' },
  medium: { color: '#f59e0b', label: 'Medium confidence' },
  high: { color: '#22c55e', label: 'High confidence' },
};

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
};
