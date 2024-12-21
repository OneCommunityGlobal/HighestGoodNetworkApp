// import { useMemo } from 'react';
// import { normalizeVolunteerStatus } from 'utils/totalOrgSummary';
// import { VOLUNTEER_STATUS_TAB } from '../../../constants/totalOrgSummary';
// import StatisticsTab from '../StatisticsTab/StatisticsTab';

// function VolunteerStatus({ volunteerStatus, totalHoursWorked }) {
//     const normalizedData = useMemo(
//       () => normalizeVolunteerStatus(volunteerStatus, totalHoursWorked),
//       [volunteerStatus, totalHoursWorked],
//     );

//     const statsTabs = useMemo(() => {
//       return Object.entries(VOLUNTEER_STATUS_TAB).map(([key, config]) => ({
//         ...config,
//         number: normalizedData[key]?.count || 0, // Ensure number is passed to the component
//         percentageChange: Math.abs((normalizedData[key]?.comparisonPercentage || 0) * 100).toFixed(0),
//         isIncreased: (normalizedData[key]?.comparisonPercentage || 0) >= 0,
//       }));
//     }, [normalizedData]);

//     return (
//       <div className="volunteer-status-grid">
//         {statsTabs.map(tab => (
//           <StatisticsTab
//             key={tab.type}
//             title={tab.title}
//             number={tab.number}
//             percentageChange={tab.percentageChange}
//             isIncreased={tab.isIncreased}
//             type={tab.type}
//             tabBackgroundColor={tab.tabBackgroundColor}
//             shapeBackgroundColor={tab.shapeBackgroundColor}
//           />
//         ))}
//       </div>
//     );
//   }

//   export default VolunteerStatus;

import { useMemo } from 'react';
import StatisticsTab from './StatisticsTab';
import { VOLUNTEER_STATUS_TAB } from '../constants/totalOrgSummary';

function VolunteerStatus({ volunteerNumberStats, totalHoursWorked }) {
  const statsTabs = useMemo(() => {
    if (!volunteerNumberStats || !totalHoursWorked) return [];

    return [
      {
        ...VOLUNTEER_STATUS_TAB.activeVolunteers,
        number: volunteerNumberStats.activeVolunteers.count,
        percentageChange: Math.abs(
          volunteerNumberStats.activeVolunteers.comparisonPercentage * 100,
        ).toFixed(0),
        isIncreased: volunteerNumberStats.activeVolunteers.comparisonPercentage >= 0,
      },
      {
        ...VOLUNTEER_STATUS_TAB.newVolunteers,
        number: volunteerNumberStats.newVolunteers.count,
        percentageChange: Math.abs(
          volunteerNumberStats.newVolunteers.comparisonPercentage * 100,
        ).toFixed(0),
        isIncreased: volunteerNumberStats.newVolunteers.comparisonPercentage >= 0,
      },
      {
        ...VOLUNTEER_STATUS_TAB.deactivatedVolunteers,
        number: volunteerNumberStats.deactivatedVolunteers.count,
        percentageChange: Math.abs(
          volunteerNumberStats.deactivatedVolunteers.comparisonPercentage * 100,
        ).toFixed(0),
        isIncreased: volunteerNumberStats.deactivatedVolunteers.comparisonPercentage >= 0,
      },
      {
        ...VOLUNTEER_STATUS_TAB.totalHoursWorked,
        number: Math.round(totalHoursWorked.current),
        percentageChange: Math.abs(totalHoursWorked.percentage).toFixed(0),
        isIncreased: totalHoursWorked.percentage >= 0,
      },
    ];
  }, [volunteerNumberStats, totalHoursWorked]);

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
