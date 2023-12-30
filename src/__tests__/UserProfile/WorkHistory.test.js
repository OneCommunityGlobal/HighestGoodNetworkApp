import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkHistory from '../../components/UserProfile/WorkHistory';

describe('WorkHistory Component', () => {
  test('renders Hours Contributed and Volunteering History sections', () => {
    render(<WorkHistory />);

    expect(screen.getByText('Hours Contributed :')).toBeInTheDocument();
    expect(screen.getByText('Volunteering History :')).toBeInTheDocument();
  });

  test('renders badges correctly', () => {
    render(<WorkHistory />);

    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('This Month')).toBeInTheDocument();
    expect(screen.getByText('Start Date:')).toBeInTheDocument();
    expect(screen.getByText('End Date:')).toBeInTheDocument();
  });

  test('renders hours and dates correctly', () => {
    render(<WorkHistory />);

    expect(screen.getByText('10 hours')).toBeInTheDocument();
    expect(screen.getByText('40 hours')).toBeInTheDocument();
    expect(screen.getByText('06/10/2019')).toBeInTheDocument();
    expect(screen.getByText('07/11/2019')).toBeInTheDocument();
  });
});
