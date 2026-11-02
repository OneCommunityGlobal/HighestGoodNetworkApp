import { BLUE_SQUARE_STATS_COLORS } from '~/constants/totalOrgSummary';
import styles from './BlueSquareStats.module.css';
import donutStyles from '../DonutChart/DonutChart.module.css';
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

  const hasData = data.some(item => item.value !== 0);
  const pctChange = totalBlueSquares.comparisonPercentage ?? totalBlueSquares.percentageChange ?? 0;

  if (!hasData) {
    return (
      <section className={styles.blueSquareStats}>
        <div className={donutStyles.donutNoData}>
          <p className={donutStyles.noDataText}>No Blue Square data available for this period.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.blueSquareStats}>
      <div className={styles.blueSquareStatsPieChart}>
        <DonutChart
          title="TOTAL BLUE SQUARES"
          totalCount={totalBlueSquares.count}
          percentageChange={Number(pctChange)}
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
