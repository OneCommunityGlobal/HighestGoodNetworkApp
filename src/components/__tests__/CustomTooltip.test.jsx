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
});
