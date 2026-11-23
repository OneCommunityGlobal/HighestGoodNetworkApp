import { render, screen } from '@testing-library/react';
import CustomTooltip from '../CustomTooltip';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  container.remove();
  container = null;
});

describe('CustomTooltip', () => {
  const payload = [{ payload: { name: 'Bucket', value: 7, percentage: 70 } }];

  it('renders hours and percentage when hoursDistribution type', () => {
    render(<CustomTooltip active payload={payload} tooltipType="hoursDistribution" />, container);

    expect(screen.getByText(/Bucket/)).toBeInTheDocument();
    expect(screen.getByText(/Hours: 7/)).toBeInTheDocument();
    expect(screen.getByText(/Percentage: 70%/)).toBeInTheDocument();
  });

  it('falls back to total hours when no tooltipType provided', () => {
    const payload2 = [{ payload: { name: 'Foo', totalHours: 12, percentage: 50 } }];
    render(<CustomTooltip active payload={payload2} />, container);
    expect(screen.getByText(/Total Hours: 12/)).toBeInTheDocument();
    expect(screen.getByText(/Percentage: 50%/)).toBeInTheDocument();
  });

  it('uses a custom valueLabel when provided (e.g. Team Stats showing Volunteers, not Total Hours)', () => {
    const payload2 = [{ payload: { name: 'In Team', totalHours: 963 } }];
    render(<CustomTooltip active payload={payload2} valueLabel="Volunteers" />, container);
    expect(screen.getByText(/Volunteers: 963/)).toBeInTheDocument();
    expect(screen.queryByText(/Total Hours/)).not.toBeInTheDocument();
  });

  it('rounds the value to a whole number when formatValue is set, without affecting callers that leave it off', () => {
    const payload2 = [{ payload: { name: 'In Team', totalHours: 963.7 } }];
    render(
      <CustomTooltip active payload={payload2} valueLabel="Volunteers" formatValue />,
      container,
    );
    expect(screen.getByText(/Volunteers: 964/)).toBeInTheDocument();
    expect(screen.queryByText(/963\.7/)).not.toBeInTheDocument();
  });
});
