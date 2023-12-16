// eslint-disable-next-line default-param-last,import/prefer-default-export
export const timeEntriesForSpecifiedPeriodReducer = (timeEntries = null, action) => {
  if (action.type === 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD') {
    return action.payload;
  }

  return timeEntries;
};
