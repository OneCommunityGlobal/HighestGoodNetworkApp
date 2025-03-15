import { useMemo } from 'react';
import { normalizeVolunteerStats } from 'utils/totalOrgSummary';
import Loading from 'components/common/Loading';
import StatisticsTab from '../StatisticsTab/StatisticsTab';

function VolunteerStatus({ isLoading, volunteerNumberStats, totalHoursWorked }) {
  const statsTabs = useMemo(() => normalizeVolunteerStats(volunteerNumberStats, totalHoursWorked), [
    volunteerNumberStats,
    totalHoursWorked,
  ]);

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
    <div className="volunteer-status-grid" role="region" aria-label="Volunteer Status Statistics">
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
        />
      ))}
    </div>
  );
}

export default VolunteerStatus;
