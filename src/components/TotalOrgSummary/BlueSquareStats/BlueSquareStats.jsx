import { BLUE_SQUARE_STATS_COLORS } from '~/constants/totalOrgSummary';
import styles from './BlueSquareStats.module.css';
import donutStyles from '../DonutChart/DonutChart.module.css';
import Loading from '~/components/common/Loading';
import DonutChart from '../DonutChart/DonutChart';

function BlueSquareStats({ isLoading, blueSquareStats, comparisonType, darkMode }) {
  if (isLoading || !blueSquareStats) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  const {
    totalBlueSquares = { count: 0 },
    missingHours = { count: 0 },
    missingSummary = { count: 0 },
    missingHoursAndSummary = { count: 0 },
    vacationTime = { count: 0 },
    other = { count: 0 },
  } = blueSquareStats;

  const data = [
    { label: 'Missing Hours', value: missingHours?.count || 0 },
    { label: 'Missing Summary', value: missingSummary?.count || 0 },
    { label: 'Missing Both Hours & Summary', value: missingHoursAndSummary?.count || 0 },
    { label: 'Vacation Time', value: vacationTime?.count || 0 },
    { label: 'Other', value: other?.count || 0 },
  ];

  const hasData = data.some(item => item.value !== 0);
  const pctChange =
    totalBlueSquares?.comparisonPercentage ?? totalBlueSquares?.percentageChange ?? 0;

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
          totalCount={totalBlueSquares?.count || 0}
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