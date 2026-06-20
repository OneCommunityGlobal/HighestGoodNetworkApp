// eslint-disable-next-line default-param-last
export const allTimeEntriesReducer = (allTimeEntries = null, action) => {
  if (action.type === 'GET_ALL_TIME_ENTRIES') {
    return action.payload;
  }

  return allTimeEntries;
};

export default allTimeEntriesReducer;
