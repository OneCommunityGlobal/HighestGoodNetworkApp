import moment from 'moment';
import 'moment-timezone';

const dueDateThisWeek = moment()
  .tz('America/Los_Angeles')
  .endOf('week')
  .toISOString();
const dueDateLastWeek = moment()
  .tz('America/Los_Angeles')
  .endOf('week')
  .subtract(1, 'week')
  .toISOString();
const dueDateBeforeLast = moment()
  .tz('America/Los_Angeles')
  .endOf('week')
  .subtract(2, 'week')
  .toISOString();

export const weeklySummaryMockData1 = {
  mediaUrl: 'u',
  weeklySummariesCount: 2,
  weeklySummaries: [
    {
      dueDate: dueDateThisWeek,
      _id: '1',
      summary: 'c',
    },
    {
      dueDate: dueDateLastWeek,
      _id: '2',
      summary: 'b',
    },
    {
      dueDate: dueDateBeforeLast,
      _id: '1',
      summary: 'a',
    },
  ],
};

// Arrange the mock data so that the dueDate is in the past.
export const weeklySummaryMockData2 = {
  mediaUrl: 'u',
  weeklySummariesCount: 0,
  weeklySummaries: [
    {
      dueDate: dueDateLastWeek,
      _id: '1',
      summary: 'a',
    },
  ],
};
