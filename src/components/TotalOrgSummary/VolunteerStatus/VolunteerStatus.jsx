import { useMemo } from 'react';
import { normalizeVolunteerStatus } from 'utils/totalOrgSummary';
import { VOLUNTEER_STATUS_TAB } from '../../../constants/totalOrgSummary';
import StatisticsTab from '../StatisticsTab/StatisticsTab';

function VolunteerStatus({ volunteerStatus, totalHoursWorked }) {
  const normalizedData = useMemo(
    () => normalizeVolunteerStatus(volunteerStatus, totalHoursWorked),
    [volunteerStatus, totalHoursWorked],
  );

  const statsTabs = useMemo(() => {
    return Object.entries(VOLUNTEER_STATUS_TAB).map(([key, config]) => ({
      ...config,
      number: normalizedData[key]?.count || 0, // Ensure number is passed to the component
      percentageChange: Math.abs((normalizedData[key]?.comparisonPercentage || 0) * 100).toFixed(0),
      isIncreased: (normalizedData[key]?.comparisonPercentage || 0) >= 0,
    }));
  }, [normalizedData]);

  return (
    <div className="volunteer-status-grid">
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
