export const STATUS_PIE_CUTOUT = '62%';

export const STATUS_PIE_LAYOUT_PADDING = {
  top: 22,
  right: 58,
  bottom: 22,
  left: 58,
};

export const getStatusLabelTheme = (darkMode = false) => ({
  lineColor: darkMode ? '#ffffff' : '#4f4f4f',
  backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.95)',
  borderColor: darkMode ? 'rgba(255, 255, 255, 0.45)' : '#d0d0d0',
});

export const formatStatusPercentageChange = (percentageChange, comparisonType) =>
  percentageChange >= 0
    ? `+${percentageChange}% ${comparisonType.toUpperCase()}`
    : `${percentageChange}% ${comparisonType.toUpperCase()}`;

/**
 * Shared Chart.js options for volunteer/mentor status doughnuts.
 * Keeps outside labels and dark-mode connector colors consistent.
 */
export const buildStatusPieChartOptions = (total, darkMode = false) => {
  const labelTheme = getStatusLabelTheme(darkMode);

  return {
    plugins: {
      centerText: false,
      datalabels: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      externalLabelGuides: {
        placement: 'outside',
        outsideGap: 10,
        minimumLabelSpacing: 6,
        connectorRadialOffset: 6,
        containmentPadding: 4,
        fontSize: 12,
        lineHeight: 14,
        padding: { x: 6, y: 4 },
        lineColor: labelTheme.lineColor,
        backgroundColor: labelTheme.backgroundColor,
        borderColor: labelTheme.borderColor,
        total,
        formatter: ({ value, percentage }) => [`${value}`, `(${percentage}%)`],
      },
    },
    maintainAspectRatio: false,
    cutout: STATUS_PIE_CUTOUT,
    layout: {
      padding: STATUS_PIE_LAYOUT_PADDING,
    },
  };
};
