import React from 'react';
import DonutChart from './DonutChart';
import './BlueSquareStats.css';
import { BLUE_SQUARE_STATS, BLUE_SQUARE_STATS_COLORS } from 'constants/totalOrgSummary';
function BlueSquareStats() {
  return (
    <section className="blue-square-stats">
      <h1 className="blue-square-stats-title">BlueSquareStats</h1>
      <div className="blue-square-stats-pie-chart">
        <DonutChart
          data={BLUE_SQUARE_STATS}
          width={300}
          height={300}
          innerRadius={80}
          outerRadius={100}
          totalText="Total Blue Squares: 145"
          colors={BLUE_SQUARE_STATS_COLORS}
        />
      </div>
    </section>
  );
}

export default BlueSquareStats;
