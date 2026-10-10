import { render, screen } from '@testing-library/react';
import { HoursWorkList } from '../VolunteerHoursDistribution';

describe('HoursWorkList label formatting', () => {
  it('renders cleaned, human-readable labels in the legend list', () => {
    // The main component passes normalized/merged structural records down to this list view
    const mockNormalizedData = [
      { _id: '10', count: 5 },
      { _id: '40', count: 2 },
      { _id: '40+', count: 4 },
    ];

    render(<HoursWorkList data={mockNormalizedData} darkMode={false} />);

    // Asserting against the updated, clean text formats
    expect(screen.getByText('0-10 hrs')).toBeInTheDocument();
    expect(screen.getByText('31-40 hrs')).toBeInTheDocument();
    expect(screen.getByText('Over 40 hrs')).toBeInTheDocument();
  });
});
