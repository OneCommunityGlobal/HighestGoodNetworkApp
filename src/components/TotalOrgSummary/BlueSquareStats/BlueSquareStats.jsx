import { BLUE_SQUARE_STATS, BLUE_SQUARE_STATS_COLORS } from 'constants/totalOrgSummary';
import DonutChart from './DonutChart';
import './BlueSquareStats.css';

function BlueSquareStats() {
  return (
    <section className="blue-square-stats">
      <h1 className="blue-square-stats-title">BlueSquareStats</h1>
      <div className="blue-square-stats-pie-chart">
        <DonutChart
          data={BLUE_SQUARE_STATS}
          width={600}
          height={600}
          innerRadius={120}
          outerRadius={220}
          totalBlueSquares={145}
          colors={BLUE_SQUARE_STATS_COLORS}
        />
      </div>
    </section>
  );
}

export default BlueSquareStats;
