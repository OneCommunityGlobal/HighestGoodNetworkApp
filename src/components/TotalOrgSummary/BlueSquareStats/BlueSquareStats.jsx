import { BLUE_SQUARE_STATS, BLUE_SQUARE_STATS_COLORS } from 'constants/totalOrgSummary';
import './BlueSquareStats.css';
import DonutChart from '../DonutChart/DonutChart';

function BlueSquareStats() {
  const { totalBlueSquares, percentageChange, data } = BLUE_SQUARE_STATS;

  return (
    <section className="blue-square-stats">
      <h1 className="blue-square-stats-title">BlueSquareStats</h1>
      <div className="blue-square-stats-pie-chart">
        <DonutChart
          title="TOTAL BLUE SQUARES"
          totalCount={totalBlueSquares}
          percentageChange={percentageChange}
          data={data}
          colors={BLUE_SQUARE_STATS_COLORS}
        />
      </div>
    </section>
  );
}

export default BlueSquareStats;
