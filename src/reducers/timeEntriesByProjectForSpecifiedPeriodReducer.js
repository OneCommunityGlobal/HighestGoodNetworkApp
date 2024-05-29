export const timeEntriesByProjectForSpecifiedPeriodReducer = (timeEntries = null, action) => {
  if (action.type === 'GET_TIME_ENTRY_BY_Project_FOR_SPECIFIED_PERIOD') {
    return action.payload;
  }

  return timeEntries;
};
