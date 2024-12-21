import { VOLUNTEER_STATUS_TAB } from '../constants/totalOrgSummary';

export const normalizeVolunteerStats = (volunteerNumberStats, totalHoursWorked) => {
  if (!volunteerNumberStats || !totalHoursWorked) return [];

  const normalizeStats = (stats, key) => ({
    ...VOLUNTEER_STATUS_TAB[key],
    number: stats.count,
    percentageChange: Math.abs((stats.comparisonPercentage ?? 0) * 100).toFixed(0),
    isIncreased: (stats.comparisonPercentage ?? 0) >= 0,
  });

  return [
    normalizeStats(volunteerNumberStats.activeVolunteers, 'activeVolunteers'),
    normalizeStats(volunteerNumberStats.newVolunteers, 'newVolunteers'),
    normalizeStats(volunteerNumberStats.deactivatedVolunteers, 'deactivatedVolunteers'),
    {
      ...VOLUNTEER_STATUS_TAB.totalHoursWorked,
      number: Math.round(totalHoursWorked.current),
      percentageChange: Math.abs(totalHoursWorked.percentage ?? 0).toFixed(0),
      isIncreased: (totalHoursWorked.percentage ?? 0) >= 0,
    },
  ];
};

