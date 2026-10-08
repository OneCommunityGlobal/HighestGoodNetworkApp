import { VOLUNTEER_STATUS_TAB, VOLUNTEER_ACTIVITIES_TAB } from '../constants/totalOrgSummary';

export const normalizeVolunteerStats = (volunteerNumberStats = {}, totalHoursWorked = {}) => {
  const statsObj = volunteerNumberStats || {};

  const normalizeStats = (stats, key) => {
    const countValue = typeof stats === 'object' && stats !== null
      ? (stats?.current ?? stats?.count ?? stats?.total ?? stats?.value ?? 0)
      : (Number(stats) || 0);

    const percentage = typeof stats === 'object' && stats !== null
      ? (stats?.comparisonPercentage ?? stats?.percentage ?? 0)
      : 0;

    return {
      ...VOLUNTEER_STATUS_TAB[key],
      number: countValue,
      percentageChange: Math.abs(percentage * 100).toFixed(0),
      isIncreased: percentage >= 0,
    };
  };

  const hoursData = totalHoursWorked || {};
  const hoursCount = typeof hoursData === 'object' && hoursData !== null
    ? (hoursData.current ?? hoursData.total ?? hoursData.value ?? hoursData.count ?? 0)
    : (Number(hoursData) || 0);

  const hoursPercentage = typeof hoursData === 'object' && hoursData !== null
    ? (hoursData.percentage ?? hoursData.comparisonPercentage ?? 0)
    : 0;

  return [
    normalizeStats(statsObj.activeVolunteers, 'activeVolunteers'),
    normalizeStats(statsObj.newVolunteers, 'newVolunteers'),
    normalizeStats(statsObj.mentorNumberStats?.totalMentors ?? 83, 'mentors'),
    normalizeStats(statsObj.deactivatedVolunteers, 'deactivatedVolunteers'),
    {
      ...VOLUNTEER_STATUS_TAB.totalHoursWorked,
      number: Math.round(hoursCount),
      percentageChange: Math.abs(hoursPercentage * 100).toFixed(0),
      isIncreased: hoursPercentage >= 0,
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
    const current = typeof data === 'object' && data !== null
      ? (data.current ?? data.count ?? data.total ?? data.value ?? 0)
      : (Number(data) || 0);

    const percentage = typeof data === 'object' && data !== null
      ? (data.percentage ?? data.comparisonPercentage ?? 0)
      : 0;

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