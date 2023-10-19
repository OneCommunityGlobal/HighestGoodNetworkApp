// eslint-disable-next-line import/prefer-default-export
export const allTimeEntriesReducer = (action, allTimeEntries = null) => {
  if (action.type === 'GET_ALL_TIME_ENTRIES') {
    return action.payload;
  }

  return allTimeEntries;
};
