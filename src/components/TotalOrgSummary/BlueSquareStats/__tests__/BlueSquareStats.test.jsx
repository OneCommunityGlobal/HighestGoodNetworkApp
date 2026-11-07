/* Version 1.0.0 */
import { render, screen } from '@testing-library/react';
import BlueSquareStats from '../BlueSquareStats';

vi.mock('../../DonutChart/DonutChart', () => ({
  default: ({ totalCount, data }) => (
    <div data-testid="chart">{JSON.stringify({ totalCount, data })}</div>
  ),
}));

describe('BlueSquareStats', () => {
  it.each([undefined, null, {}])(
    'shows the empty state for missing statistics: %s',
    blueSquareStats => {
      render(<BlueSquareStats blueSquareStats={blueSquareStats} />);
      expect(
        screen.getByText('No Blue Square data available for this period.'),
      ).toBeInTheDocument();
    },
  );

  it('renders partial statistics without crashing and totals the available categories', () => {
    render(<BlueSquareStats blueSquareStats={{ missingHours: { count: 2 } }} />);
    const chart = JSON.parse(screen.getByTestId('chart').textContent);
    expect(chart.totalCount).toBe(2);
    expect(chart.data.map(item => item.value)).toEqual([2, 0, 0, 0, 0]);
  });

  it('keeps the total returned by the backend', () => {
    render(
      <BlueSquareStats
        blueSquareStats={{ totalBlueSquares: { count: 5 }, missingHours: { count: 2 } }}
      />,
    );
    expect(JSON.parse(screen.getByTestId('chart').textContent).totalCount).toBe(5);
  });
});
