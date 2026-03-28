import { render, screen } from '@testing-library/react';
import React from 'react';

import { formatChartLabelValue, renderCenterLabel } from '../HoursWorkedPieChart';

describe('formatChartLabelValue', () => {
  it('formats all chart labels in a consistent compact style', () => {
    expect(formatChartLabelValue(190134)).toBe('190K');
    expect(formatChartLabelValue(26713)).toBe('26.7K');
    expect(formatChartLabelValue(11000)).toBe('11K');
    expect(formatChartLabelValue(7857)).toBe('7.9K');
    expect(formatChartLabelValue(6285)).toBe('6.3K');
    expect(formatChartLabelValue(999)).toBe('999');
  });
});

describe('renderCenterLabel', () => {
  it('renders the donut center text once with the total hour value', () => {
    render(<svg>{renderCenterLabel({ darkMode: true, isMobile: false, totalHours: 241989 })}</svg>);

    expect(screen.getAllByText('TOTAL HOURS')).toHaveLength(1);
    expect(screen.getByText('WORKED')).toBeInTheDocument();
    expect(screen.getByText('241,989')).toBeInTheDocument();
  });
});