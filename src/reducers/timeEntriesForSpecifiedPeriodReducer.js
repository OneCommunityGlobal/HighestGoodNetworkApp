// eslint-disable-next-line default-param-last
export const timeEntriesForSpecifiedPeriodReducer = (timeEntries = null, action) => {
  if (action.type === 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD') {
    return action.payload;
  }

  return timeEntries;
};

export default timeEntriesForSpecifiedPeriodReducer;
