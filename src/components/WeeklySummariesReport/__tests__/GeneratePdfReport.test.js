import React from 'react';
import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import mockSummaries from 'weeklySummariesReportData'; // Located in the tested component's __mocks__ folder
import GeneratePdfReport from '../GeneratePdfReport';

const getWeekDates = () => ({
  fromDate: 'June 14th',
  toDate: 'June 20th, 2020',
});
const dummy_summary = [];
const dummy_WeekDates = () => ({
  fromDate: 'June 14th, 2022',
  toDate: 'July 20th, 2023',
});
const weekidx1 = 1;
const weekidx2 = 2;
describe('structure test', () => {
  beforeEach(() => {
    render(<GeneratePdfReport summaries={dummy_summary} weekIndex={weekidx2} weekDates={dummy_WeekDates()} />);
  });
  it('should render button that generates PDF reports', () => {
    expect(screen.getByRole('button', { name: /Open PDF/i }));
  });
});

describe('FormattedReport Component', () => {
  it('Snapshot with mocked data', () => {
    const { asFragment } = render(
      <GeneratePdfReport summaries={mockSummaries} weekIndex={weekidx1} weekDates={getWeekDates()} />,
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
