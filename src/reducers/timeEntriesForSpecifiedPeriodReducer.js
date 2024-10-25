// Adjusted the parameter order to place the default parameter last
export default function timeEntriesForSpecifiedPeriodReducer(
  action,
  timeEntries = null
) {
  if (action.type === 'GET_TIME_ENTRY_FOR_SPECIFIED_PERIOD') {
    return action.payload;
  }

  return timeEntries;
}
