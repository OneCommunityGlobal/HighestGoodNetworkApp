// eslint-disable-next-line default-param-last,import/prefer-default-export
export const timeEntriesForSpecifiedProjectReducer = (timeEntries = null, action) => {
  if (action.type === 'GET_TIME_ENTRY_FOR_SPECIFIED_PROJECT') {
    return action.payload;
  }

  return timeEntries;
};
