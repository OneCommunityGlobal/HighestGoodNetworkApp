import { BLUE_SQUARE_STATS_COLORS } from 'constants/totalOrgSummary';
import './BlueSquareStats.css';
import DonutChart from '../DonutChart/DonutChart';

function BlueSquareStats({ blueSquareStats }) {
  if (!blueSquareStats) {
    return <div>Blue Square Stats data is not available</div>;
  }

  const {
    totalBlueSquares,
    missingHours,
    missingSummary,
    missingHoursAndSummary,
    vacationTime,
    other,
  } = blueSquareStats;

  const data = [
    { label: 'Missing Hours', value: missingHours.count },
    { label: 'Missing Summary', value: missingSummary.count },
    { label: 'Missing Both Hours & Summary', value: missingHoursAndSummary.count },
    { label: 'Vacation Time', value: vacationTime.count },
    { label: 'Other', value: other.count },
  ];

  return (
    <section className="blue-square-stats">
      <h2 className="blue-square-stats-title">Blue Square Stats</h2>
      <div className="blue-square-stats-pie-chart">
        <DonutChart
          title="TOTAL BLUE SQUARES"
          totalCount={totalBlueSquares.count}
          percentageChange={totalBlueSquares.comparisonPercentage}
          data={data}
          colors={BLUE_SQUARE_STATS_COLORS}
        />
      </div>
    </section>
  );
}

export default BlueSquareStats;
