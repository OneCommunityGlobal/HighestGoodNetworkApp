import { useMemo } from 'react';
import { normalizeVolunteerStats } from '~/utils/totalOrgSummary';
import Loading from '~/components/common/Loading';
import StatisticsTab from '../StatisticsTab/StatisticsTab';
import styles from '../TotalOrgSummary.module.css';
function VolunteerStatus({ isLoading, volunteerNumberStats, totalHoursWorked, comparisonType }) {
  const statsTabs = useMemo(() => normalizeVolunteerStats(volunteerNumberStats, totalHoursWorked), [
    volunteerNumberStats,
    totalHoursWorked,
  ]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className={styles.fullViewportWidth}>
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.volunteerStatusGrid}
      data-pdf-grid
      role="region"
      aria-label="Volunteer Status Statistics"
    >
      {statsTabs.map(tab => (
        <StatisticsTab
          key={tab.type}
          title={tab.title}
          number={tab.number}
          percentageChange={tab.percentageChange}
          isIncreased={tab.isIncreased}
          type={tab.type}
          tabBackgroundColor={tab.tabBackgroundColor}
          shapeBackgroundColor={tab.shapeBackgroundColor}
          comparisonType={comparisonType}
        />
      ))}
    </div>
  );
}

export default VolunteerStatus;
