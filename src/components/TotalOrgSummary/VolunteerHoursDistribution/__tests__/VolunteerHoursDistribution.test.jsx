import { render, screen } from '@testing-library/react';
import React from 'react';

// mock HoursWorkedPieChart so we can inspect props
vi.mock('../HoursWorkedPieChart/HoursWorkedPieChart', () => {
  return {
    __esModule: true,
    default: ({ userData, totalHours }) => (
      <div
        data-testid="mock-pie"
        data-userdata={JSON.stringify(userData)}
        data-totalhours={totalHours}
      />
    ),
  };
});

import VolunteerHoursDistribution from '../VolunteerHoursDistribution';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
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

    const chart = screen.getByTestId('mock-pie');
    expect(chart).toBeInTheDocument();

    // legend/list should render counts as well
    expect(screen.getByText('10-19.99 hrs (2)')).toBeInTheDocument();

    const passedUserData = JSON.parse(chart.getAttribute('data-userdata'));
    expect(passedUserData).toEqual([
      { name: '10', value: 2, percentage: 40 },
      { name: '20', value: 3, percentage: 60 },
    ]);

    expect(chart.getAttribute('data-totalhours')).toBe('1234');
  });
});
