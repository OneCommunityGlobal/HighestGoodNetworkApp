import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import GeneratePdfReport from '../GeneratePdfReport';

const dummySummary = [];
const dummyWeekDates = () => ({
  fromDate: 'June 14th, 2022',
  toDate: 'July 20th, 2023',
});
const weekidx2 = 2;

describe('structure test', () => {
  it('should render button that generates PDF reports', () => {
    render(
      <GeneratePdfReport
        summaries={dummySummary}
        weekIndex={weekidx2}
        weekDates={dummyWeekDates()}
      />,
    );
    expect(screen.getByRole('button', { name: /Open PDF/i })).toBeInTheDocument();
  });
});
