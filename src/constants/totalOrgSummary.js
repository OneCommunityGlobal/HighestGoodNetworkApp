export const FETCH_TOTAL_ORG_SUMMARY_BEGIN = 'FETCH_TOTAL_ORG_SUMMARY_BEGIN';
export const FETCH_TOTAL_ORG_SUMMARY_SUCCESS = 'FETCH_TOTAL_ORG_SUMMARY_SUCCESS';
export const FETCH_TOTAL_ORG_SUMMARY_ERROR = 'FETCH_TOTAL_ORG_SUMMARY_ERROR';

export const VOLUNTEER_STATUS_TAB = [
  {
    title: 'Active Volunteers',
    number: 150,
    percentageChange: 5,
    isIncreased: true,
    type: 'active-volunteers',
    tabBackgroundColor: '#e8e8ff',
    shapeBackgroundColor: '#cbcbfe',
  },
  {
    title: 'New Volunteers',
    number: 30,
    percentageChange: 10,
    isIncreased: true,
    type: 'new-volunteers',
    tabBackgroundColor: '#f3fcff',
    shapeBackgroundColor: '#c1effb',
  },
  {
    title: 'Deactivated Volunteers',
    number: 5,
    percentageChange: 2,
    isIncreased: false,
    type: 'deactivated-volunteers',
    tabBackgroundColor: '#ffe9fa',
    shapeBackgroundColor: '#fecff3',
  },
  {
    title: 'Total Hours Worked',
    number: 1000,
    percentageChange: 8,
    isIncreased: true,
    type: 'total-hours-worked',
    tabBackgroundColor: '#dffddd',
    shapeBackgroundColor: '#baf0b6',
  },
];

export const VOLUNTEER_ACTIVITIES_TAB = [
  {
    title: 'Total Summary Submitted',
    type: 'total-summary-submitted',
    number: 0,
    percentageChange: 0,
    isIncreased: true,
    tabBackgroundColor: '#FDFFE6',
    // shapeBackgroundColor: '#FDF5E5',
  },
  {
    title: 'Volunteers Completed Assigned Hours',
    type: 'volunteers-completed-assigned-hours',
    number: 231,
    percentageChange: 32,
    isIncreased: true,
    tabBackgroundColor: '#FDF5E5',
    // shapeBackgroundColor: '#FDFFE6',
  },
  {
    title: 'Badges Awarded',
    type: 'badges-awarded',
    number: 3123,
    percentageChange: 67,
    isIncreased: true,
    tabBackgroundColor: '#FFF2F6',
    // shapeBackgroundColor: '#fafad2',
  },
  {
    title: 'Tasks Completed',
    type: 'tasks-completed',
    number: 987,
    percentageChange: 23,
    isIncreased: false,
    tabBackgroundColor: '#E8E8FF',
    // shapeBackgroundColor: '#ffb6c1',
  },
  {
    title: 'Total Active Teams',
    type: 'total-active-teams',
    number: 77,
    percentageChange: 1,
    isIncreased: true,
    tabBackgroundColor: '#E3F6F5',
    // shapeBackgroundColor: '#fff8dc',
  },
];
