import { BLUE_SQUARE_STATS_COLORS } from '~/constants/totalOrgSummary';
import './BlueSquareStats.css';
import Loading from '~/components/common/Loading';
import DonutChart from '../DonutChart/DonutChart';

function BlueSquareStats({ isLoading, blueSquareStats, comparisonType, darkMode }) {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  // Uncomment and remove blueSquareStats prop to test data with values
  // const blueSquareStats = {
  //   totalBlueSquares: { count: 260, comparisonPercentage: 0 },
  //   missingHours: { count: 12, percentageOutOfTotal: 5 },
  //   missingSummary: { count: 10, percentageOutOfTotal: 4 },
  //   missingHoursAndSummary: { count: 96, percentageOutOfTotal: 37 },
  //   vacationTime: { count: 100, percentageOutOfTotal: 38 },
  //   other: { count: 42, percentageOutOfTotal: 16 },
  // };

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

  const hasData = data.every(item => item.value !== 0);
  const pctChange = totalBlueSquares.comparisonPercentage ?? totalBlueSquares.percentageChange ?? 0;
  return (
    <section className="blue-square-stats">
      <div className="blue-square-stats-pie-chart">
        <DonutChart
          title="TOTAL BLUE SQUARES"
          totalCount={totalBlueSquares.count}
          percentageChange={pctChange}
          data={data}
          colors={BLUE_SQUARE_STATS_COLORS}
          comparisonType={comparisonType}
          darkMode={darkMode}
        />
      </div>
    </section>
  );
}

export default BlueSquareStats;
