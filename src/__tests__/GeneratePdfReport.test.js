import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import mockSummaries from 'weeklySummariesReportData'; // Located in the tested component's __mocks__ folder
import GeneratePdfReport from '../components/WeeklySummariesReport/GeneratePdfReport';

const getWeekDates = () => ({
  fromDate: 'June 14th',
  toDate: 'June 20th, 2020',
});

// describe('FormattedReport Component', () => {
//   it('Snapshot with mocked data', () => {
//     const { asFragment } = render(
//       <GeneratePdfReport summaries={mockSummaries} weekIndex="1" weekDates={getWeekDates()} />,
//     );

//     expect(asFragment()).toMatchSnapshot();
//   });
// });
