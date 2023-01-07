/* eslint-disable react/prop-types */
import React from 'react';
import './ReportCharts.css';

function PieChartInfoDetail({ keyName, value, color }) {
  return (
    <div className="pie-chart-info-detail-container">
      <div className="pie-chart-info-detail-item">
        <div
          className="pie-chart-legend-color-square"
          style={{ backgroundColor: `${color}` }}
        />
        <p className="pie-chart-info-key">{keyName}</p>
      </div>
      <p className="pie-chart-info-value">{value}</p>
    </div>
  );
}

export default PieChartInfoDetail;
