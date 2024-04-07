// eslint-disable-next-line no-unused-vars
import React from 'react';
import './ReportCharts.css';

function PieChartInfoDetail({ keyName, value, color, darkMode }) {
  return (
    <div className="pie-chart-info-detail-container">
      <div className="pie-chart-info-detail-item">
        <div className="pie-chart-legend-color-square" style={{ backgroundColor: `${color}` }} />
        <p className={`pie-chart-info-key ${darkMode ? 'text-light' : ''}`}>{keyName}</p>
      </div>
      <p className={`pie-chart-info-value ${darkMode ? 'text-light' : ''}`} style={{ marginTop: '16px', marginLeft: '120px' }}>
        {value}
      </p>
    </div>
  );
}

export default PieChartInfoDetail;
