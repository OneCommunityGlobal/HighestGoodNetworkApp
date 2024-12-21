export const FETCH_TOTAL_ORG_SUMMARY_BEGIN = 'FETCH_TOTAL_ORG_SUMMARY_BEGIN';
export const FETCH_TOTAL_ORG_SUMMARY_SUCCESS = 'FETCH_TOTAL_ORG_SUMMARY_SUCCESS';
export const FETCH_TOTAL_ORG_SUMMARY_ERROR = 'FETCH_TOTAL_ORG_SUMMARY_ERROR';

export const VOLUNTEER_STATUS_TAB = {
  activeVolunteers: {
    title: 'Active Volunteers',
    type: 'active-volunteers',
    tabBackgroundColor: '#e8e8ff',
    shapeBackgroundColor: '#cbcbfe',
  },
  newVolunteers: {
    title: 'New Volunteers',
    type: 'new-volunteers',
    tabBackgroundColor: '#f3fcff',
    shapeBackgroundColor: '#c1effb',
  },
  deactivatedVolunteers: {
    title: 'Deactivated Volunteers',
    type: 'deactivated-volunteers',
    tabBackgroundColor: '#ffe9fa',
    shapeBackgroundColor: '#fecff3',
  },
  totalHoursWorked: {
    title: 'Total Hours Worked',
    type: 'total-hours-worked',
    tabBackgroundColor: '#dffddd',
    shapeBackgroundColor: '#baf0b6',
  },
};

export const VOLUNTEER_ACTIVITIES_TAB = [
  {
    title: 'Total Summaries Submitted',
    type: 'totalSummariesSubmitted',
    number: 0,
    percentageChange: 0,
    isIncreased: true,
    tabBackgroundColor: '#FDFFE6',
  },
  {
    title: 'Volunteers Completed Assigned Hours',
    type: 'volunteersCompletedAssignedHours',
    number: 231,
    percentageChange: 32,
    isIncreased: true,
    tabBackgroundColor: '#FDF5E5',
  },
  {
    title: 'Badges Awarded',
    type: 'totalBadgesAwarded',
    number: 3123,
    percentageChange: 67,
    isIncreased: true,
    tabBackgroundColor: '#FFF2F6',
  },
  {
    title: 'Tasks Completed',
    type: 'completedTasks',
    number: 987,
    percentageChange: 23,
    isIncreased: false,
    tabBackgroundColor: '#E8E8FF',
  },
  {
    title: 'Total Active Teams',
    type: 'totalActiveTeams',
    number: 77,
    percentageChange: 1,
    isIncreased: true,
    tabBackgroundColor: '#E3F6F5',
  },
];
