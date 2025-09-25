import { useMemo } from 'react';
import { normalizeVolunteerActivities } from '~/utils/totalOrgSummary';
import Loading from '~/components/common/Loading';
import StatisticsTab from '../StatisticsTab/StatisticsTab';
import styles from '../TotalOrgSummary.module.css';

function VolunteerActivities({
  isLoading,
  totalSummariesSubmitted,
  completedAssignedHours,
  totalBadgesAwarded,
  tasksStats,
  totalActiveTeams,
  comparisonType,
}) {
  const volunteerActivitiesTabs = useMemo(
    () =>
      normalizeVolunteerActivities(
        totalSummariesSubmitted,
        completedAssignedHours,
        totalBadgesAwarded,
        tasksStats,
        totalActiveTeams,
      ),
    [
      totalSummariesSubmitted,
      completedAssignedHours,
      totalBadgesAwarded,
      tasksStats,
      totalActiveTeams,
    ],
  );

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div
      className={styles.volunteerStatusGrid} // ⬅️ use module class
      role="region"
      aria-label="Volunteer Activities Statistics"
    >
      {volunteerActivitiesTabs.map(tab => (
        <StatisticsTab
          key={tab.type}
          title={tab.title}
          number={tab.number}
          percentageChange={tab.percentageChange}
          isIncreased={tab.isIncreased}
          type={tab.type}
          tabBackgroundColor={tab.tabBackgroundColor}
          comparisonType={comparisonType}
        />
      ))}
    </div>
  );
}

export default VolunteerActivities;
