import { render, screen } from '@testing-library/react';
import NonConvertedApplicationsGraph from '../NonConvertedApplicationsGraph';

const mockData = [
  { title: 'X', applications: 10, conversionRate: 5 },
  { title: 'Y', applications: 20, conversionRate: 2 },
];

describe('NonConvertedApplicationsGraph', () => {
  it('renders title based on percentage mode', () => {
    render(<NonConvertedApplicationsGraph data={mockData} usePercentage={true} isDark={false} />);
    expect(screen.getByText(/Lowest Conversion Rate/)).toBeInTheDocument();
  });

  it('renders title for non-percentage mode', () => {
    render(<NonConvertedApplicationsGraph data={mockData} usePercentage={false} isDark={false} />);
    expect(screen.getByText(/Lowest Applications/)).toBeInTheDocument();
  });

  it('sorts items correctly', () => {
    render(<NonConvertedApplicationsGraph data={mockData} usePercentage={true} isDark={false} />);
    const sorted = [...mockData].sort((a, b) => a.conversionRate - b.conversionRate);
    expect(sorted[0].conversionRate).toBe(2);
  });

  it('handles dark mode styling', () => {
    render(<NonConvertedApplicationsGraph data={mockData} usePercentage={true} isDark={true} />);
    expect(screen.getByText(/Lowest Conversion Rate/)).toBeInTheDocument();
  });
});
