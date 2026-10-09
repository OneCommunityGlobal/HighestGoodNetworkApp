import { render, screen } from '@testing-library/react';
import React from 'react';

import VolunteerHoursDistribution, { computeDistribution } from '../VolunteerHoursDistribution';

// Chart.js draws to a <canvas> jsdom doesn't implement; the legend and center label are plain DOM.
vi.mock('react-chartjs-2', () => ({ Doughnut: () => null }));

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '600px';
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
  container = null;
});

describe('VolunteerHoursDistribution wrapper', () => {
  it('shows volunteer counts per bucket and total hours in the centre', () => {
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

    // slices are volunteers (2 and 3), not hours split across buckets
    expect(screen.getByText('10-19 hrs: 2 volunteers (40.0%)')).toBeInTheDocument();
    expect(screen.getByText('20-29 hrs: 3 volunteers (60.0%)')).toBeInTheDocument();
    // centre still shows the headline total hours
    expect(screen.getByText('1234')).toBeInTheDocument();

    const computed = computeDistribution(hoursData, totalHoursData);
    expect(computed).toEqual({
      userData: [
        { name: '10-19 hrs', value: 2, percentage: 40, valueType: 'volunteers' },
        { name: '20-29 hrs', value: 3, percentage: 60, valueType: 'volunteers' },
      ],
      totalVolunteers: 5,
      totalHoursWorked: 1234,
    });
  });

  it('renders committed-hours buckets as volunteer counts with a volunteer center total', () => {
    const committedHoursData = [
      { _id: 10, count: 2 },
      { _id: 20, count: 3 },
      { _id: 30, count: 1 },
      { _id: 40, count: 1 },
      { _id: '40+', count: 1 },
    ];

    render(
      <VolunteerHoursDistribution
        isLoading={false}
        darkMode={false}
        hoursData={committedHoursData}
        title="Weekly Committed Hours"
        centerLabelLines={['TOTAL', 'VOLUNTEERS']}
        useBucketCounts
      />,
      { container },
    );

    expect(screen.getByText('Weekly Committed Hours')).toBeInTheDocument();
    expect(screen.getByText('40 hrs: 1 volunteers (12.5%)')).toBeInTheDocument();
    expect(screen.getByText('Over 40 hrs: 1 volunteers (12.5%)')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('VOLUNTEERS')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();

    expect(computeDistribution(committedHoursData, undefined, true)).toEqual({
      userData: [
        { name: '10-19 hrs', value: 2, percentage: 25, valueType: 'volunteers' },
        { name: '20-29 hrs', value: 3, percentage: 38, valueType: 'volunteers' },
        { name: '30-39 hrs', value: 1, percentage: 13, valueType: 'volunteers' },
        { name: '40 hrs', value: 1, percentage: 13, valueType: 'volunteers' },
        { name: 'Over 40 hrs', value: 1, percentage: 13, valueType: 'volunteers' },
      ],
      totalVolunteers: 8,
      totalHoursWorked: 8,
    });
  });
});

describe('empty committed hours', () => {
  it('explains that committed hours are not available yet instead of a blank chart', () => {
    render(
      <VolunteerHoursDistribution
        isLoading={false}
        darkMode={false}
        hoursData={undefined}
        title="Weekly Committed Hours"
        centerLabelLines={['TOTAL', 'VOLUNTEERS']}
        useBucketCounts
      />,
      { container },
    );
    expect(screen.getByText('Weekly committed hours are not available yet')).toBeInTheDocument();
  });
});

describe('bucket ordering', () => {
  it('keeps 50-59 before 50+ when both start at 50', () => {
    const { userData } = computeDistribution(
      [
        { _id: '50+', count: 45 },
        { _id: '50', count: 22 },
        { _id: '10', count: 932 },
      ],
      { current: 999 },
    );
    expect(userData.map(d => d.name)).toEqual(['10-19 hrs', '50-59 hrs', '50+ hrs']);
  });
});
