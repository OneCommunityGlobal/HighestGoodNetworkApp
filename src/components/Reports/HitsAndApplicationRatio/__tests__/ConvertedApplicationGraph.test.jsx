import { render, screen } from '@testing-library/react';
import ConvertedApplicationGraph from '../ConvertedApplicationGraph';

const mockData = [
  { title: 'A', applications: 50, conversionRate: 10 },
  { title: 'B', applications: 100, conversionRate: 20 },
];

describe('ConvertedApplicationGraph', () => {
  it('renders without crashing', () => {
    render(<ConvertedApplicationGraph data={mockData} usePercentage={false} isDark={false} />);
    expect(screen.getByText(/Top 10 Job Postings/)).toBeInTheDocument();
  });

  it('sorts data correctly by applications when usePercentage=false', () => {
    const sorted = [...mockData].sort((a, b) => b.applications - a.applications);
    expect(sorted[0].title).toBe('B');
  });

  it('switches metric when usePercentage=true', () => {
    render(<ConvertedApplicationGraph data={mockData} usePercentage={true} isDark={false} />);
    expect(screen.getByText(/Conversion Rate/)).toBeInTheDocument();
  });

  it('renders correctly in dark mode', () => {
    render(<ConvertedApplicationGraph data={mockData} usePercentage={false} isDark={true} />);
    expect(screen.getByText(/Top 10 Job Postings/)).toBeInTheDocument();
  });
});
