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

    // Assert using the corrected formatted range strings, matching assignToBucket's
    // actual threshold boundaries (inclusive upper bound, first bucket starts at 0)
    expect(screen.getByText('0-10 hrs')).toBeInTheDocument();
    expect(screen.getByText('11-20 hrs')).toBeInTheDocument();

    // Verify computeDistribution now allocates hours to buckets so slices add up to total hours
    const computed = computeDistribution(hoursData, totalHoursData);

    // Assert that names in userData match the corrected formatRangeLabel output
    // valueType is 'hours' here since totalHoursWorked (1234) > 0
    expect(computed).toEqual({
      userData: [
        { name: '0-10 hrs', value: 494, percentage: 40, valueType: 'hours' },
        { name: '11-20 hrs', value: 740, percentage: 60, valueType: 'hours' },
      ],
      totalVolunteers: 5,
      totalHoursWorked: 1234,
    });
  });
});
