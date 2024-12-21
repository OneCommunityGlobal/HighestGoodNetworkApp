import { useMemo } from 'react';
import { normalizeVolunteerStats } from 'utils/totalOrgSummary';
import StatisticsTab from '../StatisticsTab/StatisticsTab';

function VolunteerStatus({ volunteerNumberStats, totalHoursWorked }) {
  const statsTabs = useMemo(() => normalizeVolunteerStats(volunteerNumberStats, totalHoursWorked), [
    volunteerNumberStats,
    totalHoursWorked,
  ]);

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
