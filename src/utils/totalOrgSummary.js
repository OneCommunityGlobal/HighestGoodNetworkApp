import { VOLUNTEER_STATUS_TAB, VOLUNTEER_ACTIVITIES_TAB } from '../constants/totalOrgSummary';

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

export const normalizeVolunteerActivities = (
  totalSummariesSubmitted,
  completedAssignedHours,
  totalBadgesAwarded,
  tasksStats,
  totalActiveTeams,
) => {
  const normalizeData = (data, key) => {
    if (!data) {
      return {
        ...VOLUNTEER_ACTIVITIES_TAB.find(tab => tab.type === key),
        number: 0,
        percentageChange: '0',
        isIncreased: false,
      };
    }

    const current = data.current || data.count || 0;
    const percentage = data.percentage ?? data.comparisonPercentage ?? 0;
    return {
      ...VOLUNTEER_ACTIVITIES_TAB.find(tab => tab.type === key),
      number: current,
      percentageChange: Math.abs(percentage * 100).toFixed(0),
      isIncreased: percentage >= 0,
    };
  };

  return [
    normalizeData(totalSummariesSubmitted, 'totalSummariesSubmitted'),
    normalizeData(completedAssignedHours, 'volunteersCompletedAssignedHours'),
    normalizeData(totalBadgesAwarded, 'totalBadgesAwarded'),
    normalizeData(tasksStats?.complete, 'completedTasks'),
    normalizeData(totalActiveTeams, 'totalActiveTeams'),
  ];
};
