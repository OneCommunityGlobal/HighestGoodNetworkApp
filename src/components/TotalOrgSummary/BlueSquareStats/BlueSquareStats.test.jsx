import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BlueSquareStats from './BlueSquareStats';

describe('BlueSquareStats', () => {
  it('renders the empty-state when blueSquareStats is missing', () => {
    render(
      <BlueSquareStats
        isLoading={false}
        blueSquareStats={undefined}
        comparisonType="previous"
        darkMode={false}
      />,
    );

    expect(screen.getByText('No Blue Square data available for this period.')).toBeInTheDocument();
  });
});
