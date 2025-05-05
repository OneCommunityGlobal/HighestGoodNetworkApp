// eslint-disable-next-line no-unused-vars
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import mockSummaries from '../__mocks__/weeklySummariesReportData'; // Located in the tested component's __mocks__ folder
import GeneratePdfReport from '../GeneratePdfReport';

const getWeekDates = () => ({
  fromDate: 'June 14th',
  toDate: 'June 20th, 2020',
});
const dummySummary = [];
const dummyWeekDates = () => ({
  fromDate: 'June 14th, 2022',
  toDate: 'July 20th, 2023',
});
const weekidx1 = 1;
const weekidx2 = 2;
describe('structure test', () => {
  beforeEach(() => {
    render(
      <GeneratePdfReport
        summaries={dummySummary}
        weekIndex={weekidx2}
        weekDates={dummyWeekDates()}
      />,
    );
  });
  it('should render button that generates PDF reports', () => {
    expect(screen.getByRole('button', { name: /Open PDF/i }));
  });
});
