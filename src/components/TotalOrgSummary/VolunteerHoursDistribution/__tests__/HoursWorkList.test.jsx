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
  it('converts simple numeric ids into ranges and adds hrs', () => {
    const mockData = [
      { _id: '10', count: 5 },
      { _id: '40', count: 2 },
      { _id: '50+', count: 3 },
      { _id: '40+', count: 1 },
    ];

    render(<HoursWorkList data={mockData} darkMode={false} />, { container });

    expect(screen.getByText('10-19.99 hrs (5)')).toBeInTheDocument();
    expect(screen.getByText('40-49.99 hrs (2)')).toBeInTheDocument();
    // '50+' bucket should appear for both the original 50+ and the remapped 40+
    expect(screen.getByText('50+ hrs (3)')).toBeInTheDocument();
    expect(screen.getByText('50+ hrs (1)')).toBeInTheDocument();
  });
});
