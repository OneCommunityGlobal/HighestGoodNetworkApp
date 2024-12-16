import { useMemo } from 'react';
import StatisticsTab from '../StatisticsTab/StatisticsTab';
import { VOLUNTEER_ACTIVITIES_TAB } from '../../../constants/totalOrgSummary';
import { normalizeVolunteerActivities } from 'utils/totalOrgSummary';

function VolunteerActivities(props) {
  const normalizedData = useMemo(() => normalizeVolunteerActivities(props), [props]);

  const volunteerActivitiesTab = useMemo(() => {
    return VOLUNTEER_ACTIVITIES_TAB.map(tab => ({
      ...tab,
      number: normalizedData[tab.type]?.count || 0,
      percentageChange: Math.abs(
        (normalizedData[tab.type]?.comparisonPercentage || 0) * 100,
      ).toFixed(0),
      isIncreased: (normalizedData[tab.type]?.comparisonPercentage || 0) >= 0,
    }));
  }, [normalizedData]);

  return (
    <div className="volunteer-status-grid">
      {volunteerActivitiesTab.map(tab => (
        <StatisticsTab
          key={tab.type}
          title={tab.title}
          number={tab.number}
          percentageChange={tab.percentageChange}
          isIncreased={tab.isIncreased}
          type={tab.type}
          tabBackgroundColor={tab.tabBackgroundColor}
        />
      ))}
    </div>
  );
}

export default VolunteerActivities;
