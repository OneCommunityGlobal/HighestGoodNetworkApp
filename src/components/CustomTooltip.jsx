// Universal Custom Tooltip with dark mode support and all values
import React from 'react';

const getIsDarkMode = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const getTooltipData = (payload, label) => {
  const data = (payload && payload[0] && payload[0].payload) || {};
  return {
    name: data._id || data.name || label || '',
    percentage: data.percentage,
    volunteerCount: data.value,
    totalHours: data.totalHours !== undefined ? data.totalHours : data.value,
    change: data.change,
  };
};

function CustomTooltip({ active, payload, label, tooltipType }) {
  if (!active || !payload || !payload.length) return null;

  const isDarkMode = getIsDarkMode();
  const { name, percentage, volunteerCount, totalHours, change } = getTooltipData(payload, label);
  const textColor = isDarkMode ? '#fff' : '#222';

  const renderMainValue = () => {
    if (tooltipType === 'hoursDistribution' && volunteerCount !== undefined) {
      return (
        <div style={{ color: textColor, fontWeight: 'bold' }}>
          Volunteers: {volunteerCount}
        </div>
      );
    }

    if (totalHours !== undefined) {
      return (
        <div style={{ color: textColor, fontWeight: 'bold' }}>
          Total Hours: {totalHours}
        </div>
      );
    }

    return null;
  };

  const renderChange = () => {
    if (change === undefined) return null;
    const changeColor = change < 0 ? 'red' : isDarkMode ? 'lightgreen' : 'green';
    return (
      <div style={{ color: changeColor, fontWeight: 'bold' }}>
        Change: {change}
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? '#222' : 'white',
        color: isDarkMode ? '#90cdf4' : '#222',
        border: '1px solid #ccc',
        padding: '10px 20px',
        borderRadius: '6px',
        minWidth: 120,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 4, color: textColor }}>
        {name}
      </div>
      {renderMainValue()}
      {percentage !== undefined && (
        <div style={{ color: isDarkMode ? '#90cdf4' : '#444' }}>
          Percentage: {percentage}
        </div>
      )}
      {renderChange()}
    </div>
  );
}

export default CustomTooltip;
