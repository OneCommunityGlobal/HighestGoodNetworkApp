// Universal Custom Tooltip with dark mode support and all values
import React from 'react';

function CustomTooltip({ active, payload, label, yAxisLabel }) {
  let isDarkMode = false;
  if (typeof window !== 'undefined' && window.matchMedia) {
    isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  if (active && payload && payload.length) {
    const data = payload[0].payload || {};
    // For WorkDistributionBarChart: show name, Total Hours, and percentage
    const name = data._id || data.name || label || '';
    const totalHours = data.totalHours !== undefined ? data.totalHours : data.value;
    const percentage = data.percentage;
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
        <div style={{ fontWeight: 'bold', marginBottom: 4, color: isDarkMode ? '#fff' : '#222' }}>
          {name}
        </div>
        {totalHours !== undefined && (
          <div style={{ color: isDarkMode ? '#fff' : '#222', fontWeight: 'bold' }}>
            Total Hours: {totalHours}
          </div>
        )}
        {percentage !== undefined && (
          <div style={{ color: isDarkMode ? '#90cdf4' : '#444' }}>Percentage: {percentage}</div>
        )}
        {/* For other charts, fallback to value, change, etc. */}
        {data.change !== undefined && (
          <div
            style={{
              color: data.change < 0 ? 'red' : isDarkMode ? 'lightgreen' : 'green',
              fontWeight: 'bold',
            }}
          >
            Change: {data.change}
          </div>
        )}
      </div>
    );
  }
  return null;
}

export default CustomTooltip;
