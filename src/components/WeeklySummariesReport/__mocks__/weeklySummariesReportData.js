const mockSummaries = [
  {
    _id: '1',
    firstName: 'A',
    lastName: 'B',
    mediaUrl: 'a',
    weeklySummariesCount: 3,
    weeklySummaries: [
      {
        dueDate: '2020-07-05T06:59:59.999Z',
        _id: '1',
        summary: 'Week 3 summary',
      },
      {
        dueDate: '2020-06-28T06:59:59.999Z',
        _id: '2',
        summary: 'Week 2 summary',
      },
      {
        dueDate: '2020-06-21T06:59:59.999Z',
        _id: '1',
        summary: 'Week 1 summary',
      },
    ],
  },
  {
    _id: '2',
    firstName: 'C',
    lastName: 'D',
    mediaUrl: '',
    weeklySummariesCount: 1,
    weeklySummaries: [
      {
        dueDate: '2020-07-05T06:59:59.999Z',
        _id: '1',
        summary: 'Week 2 summary',
      },
      {
        dueDate: '2020-06-28T06:59:59.999Z',
        _id: '2',
        summary: '',
      },
    ],
  },
  {
    _id: '3',
    firstName: 'E',
    lastName: 'F',
    mediaUrl: '',
    weeklySummariesCount: 0,
    weeklySummaries: [],
  },
];

export default mockSummaries;
