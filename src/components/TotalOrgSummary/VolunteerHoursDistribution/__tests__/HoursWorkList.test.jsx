import { render, screen } from '@testing-library/react';
import { HoursWorkList } from '../VolunteerHoursDistribution';

let container = null;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
  container = null;
});

describe('HoursWorkList label formatting', () => {
  it('renders plain bucket ids in the legend and merges 40+ into 50+', () => {
    const mockData = [
      { _id: '10', count: 5 },
      { _id: '40', count: 2 },
      { _id: '50+', count: 3 },
      { _id: '40+', count: 1 },
    ];

    render(<HoursWorkList data={mockData} darkMode={false} />, { container });

    // legend now shows plain bucket IDs (no range suffix, no count)
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    // 50+ and 40+ are merged into a single 50+ bucket
    expect(screen.getByText('50+')).toBeInTheDocument();
  });
});
