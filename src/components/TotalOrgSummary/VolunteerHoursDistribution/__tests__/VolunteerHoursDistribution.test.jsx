// Note: render real chart in a sized container so Recharts can mount in tests.

import { render, screen } from '@testing-library/react';
import React from 'react';

import VolunteerHoursDistribution, { computeDistribution } from '../VolunteerHoursDistribution';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  // give the container explicit size so ResponsiveContainer can compute dimensions
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
});
afterEach(() => {
  container.remove();
  container = null;
});

describe('VolunteerHoursDistribution wrapper', () => {
  it('passes totalHoursData.current to child and computes userData percentages', () => {
    const hoursData = [
      { _id: '10', count: 2 },
      { _id: '20', count: 3 },
    ];
    const totalHoursData = { current: 1234 };
    render(
      <VolunteerHoursDistribution
        isLoading={false}
        darkMode={false}
        hoursData={hoursData}
        totalHoursData={totalHoursData}
      />,
      { container },
    );

    // legend/list should render counts as well
    expect(screen.getByText('10-19.99 hrs (2)')).toBeInTheDocument();

    // verify computeDistribution now allocates hours to buckets so slices add up to total hours
    const computed = computeDistribution(hoursData, totalHoursData);
    expect(computed).toEqual({
      userData: [
        { name: '10', value: 494, percentage: 40 },
        { name: '20', value: 740, percentage: 60 },
      ],
      totalVolunteers: 5,
      totalHoursWorked: 1234,
    });
  });
});
